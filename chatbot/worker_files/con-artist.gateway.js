/**
 * con-artist.rulathemtodos.workers.dev — Cloudflare Worker (Gateway for gabo.services)
 *
 * PURPOSE
 * - Repo (gabo.services) -> con-artist: CORS + Origin allowlist + per-origin asset identity (x-ops-asset-id)
 * - Repo handshake: POST /__repo/handshake with header x-gabo-repo-id matching env.CON_ARTIST_SERVICES (fallback env.CON_ARTIST)
 * - Iframe: GET /embed?parent=<origin> (locked to allowed parents)
 * - Chat: POST /api/chat (SSE) -> forwards to internal Service Binding (Drastic) (SSE pass-through)
 *
 * IMPORTANT
 * - This Worker MUST NOT mention or reference any downstream internal components in RESPONSES.
 *
 * REQUIRED (as configured)
 * - Secrets:
 *   - CON_ARTIST_SERVICES
 *   - CON_ARTIST_Drastic
 *   - CON_ARTIST_TO_CORE_SHARED_SECRET (kept as fallback)
 * - Variables:
 *   - CON_ARTIST_PUBLIC_ORIGIN
 *   - ORIGIN_ASSET_ID_JSON
 * - Service binding:
 *   - DRASTIC  (recommended binding name)
 */

/* -------------------------
 * HARD FALLBACK (never empty)
 * ------------------------- */
const FALLBACK_ALLOWED_ORIGINS = [
  'https://www.gabo.services',
  'https://gabo.services',
  'https://chattiavato-a11y.github.io',
  'https://con-artist.rulathemtodos.workers.dev'
];

const FALLBACK_ORIGIN_TO_ASSET = {
  'https://www.gabo.services':
    'b91f605b23748de5cf02db0de2dd59117b31c709986a3c72837d0af8756473cf2779c206fc6ef80a57fdeddefa4ea11b972572f3a8edd9ed77900f9385e94bd6',
  'https://gabo.services':
    '8cdeef86bd180277d5b080d571ad8e6dbad9595f408b58475faaa3161f07448fbf12799ee199e3ee257405b75de555055fd5f43e0ce75e0740c4dc11bf86d132',
  'https://chattiavato-a11y.github.io':
    'b8f12ffa3559cee4ac71cb5f54eba1aed46394027f52e562d20be7a523db2a036f20c6e8fb0577c0a8d58f2fd198046230ebc0a73f4f1e71ff7c377d656f0756',
  'https://con-artist.rulathemtodos.workers.dev':
    '96dd27ea493d045ed9b46d72533e2ed2ec897668e2227dd3d79fff85ca2216a569c4bf622790c6fb0aab9f17b4e92d0f8e0fa040356bee68a9c3d50d5a60c945'
};

/* -------------------------
 * Contract constants
 * ------------------------- */
const REPO_SECRET_HEADER = 'x-gabo-repo-id';
const REPO_HANDSHAKE_PATH = '/__repo/handshake';

const ROUTES = {
  chat: '/api/chat',
  health: '/health',
  api_health: '/api/health',
  embed: '/embed'
};

const ASSET_HDR_DEFAULT = 'x-ops-asset-id';

// iframe tenant header (sent by iframe JS; also allowed for direct callers)
const PARENT_HDR = 'x-gabo-parent-origin';

// internal auth headers expected by drastic-measures gateway
const CON_ARTIST_HOP_HDR = 'x-con-artist-hop';
const CON_ARTIST_HOP_VAL = 'iframe-gateway';
const CON_ARTIST_SECRET_HDR = 'x-con-artist-shared-secret';
const CON_ARTIST_MODE_IFRAME_SERVICE_QA = 'iframe_service_qa';

const HOP_HDR_DEFAULT = 'x-gabo-hop';
const HOP_VAL_DEFAULT = 'gateway';

/* -------------------------
 * Utils
 * ------------------------- */
function toStr(x) {
  return typeof x === 'string' ? x : x == null ? '' : String(x);
}

function safeTextOnly(s) {
  s = toStr(s);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 0) continue;
    const ok = c === 9 || c === 10 || c === 13 || (c >= 32 && c <= 126) || c >= 160;
    if (ok) out += s[i];
  }
  return out.trim();
}

function normalizeOrigin(value) {
  const v = toStr(value).trim();
  if (!v) return '';
  try {
    return new URL(v).origin.toLowerCase();
  } catch {
    return v.replace(/\/$/, '').toLowerCase();
  }
}

function normalizeRoutePath(value, fallback) {
  const raw = safeTextOnly(value || fallback || '');
  if (!raw) return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function timingSafeEq(a, b) {
  const x = toStr(a);
  const y = toStr(b);
  if (x.length !== y.length) return false;
  let out = 0;
  for (let i = 0; i < x.length; i++) out |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return out === 0;
}

/* -------------------------
 * Config loader (env.ORIGIN_ASSET_ID_JSON)
 * Accepts:
 *  A) full worker.config.json
 *  B) plain origin_to_asset_id map
 * Always prevents empty allowlist.
 * ------------------------- */
let _CFG = null;

function parseEnvJson(env) {
  const v = env?.ORIGIN_ASSET_ID_JSON;
  if (!v) return null;
  if (typeof v === 'object') return v;
  try {
    return JSON.parse(String(v));
  } catch {
    return null;
  }
}

function parseAllowedParentsJson(env) {
  const v = env?.CON_ARTIST_ALLOWED_PARENTS_JSON;
  if (!v) return null;
  if (typeof v === 'object') return v;
  try {
    return JSON.parse(String(v));
  } catch {
    return null;
  }
}

function buildCfg(env) {
  if (_CFG) return _CFG;

  const raw = parseEnvJson(env);

  const cfg0 =
    raw && typeof raw === 'object' && !raw.asset_identity && !raw.allowedOrigins
      ? { asset_identity: { header_name: ASSET_HDR_DEFAULT, origin_to_asset_id: raw } }
      : raw && typeof raw === 'object'
        ? raw
        : {};

  const routes = {
    chat: normalizeRoutePath(cfg0?.routes?.chat, ROUTES.chat),
    health: normalizeRoutePath(cfg0?.routes?.health, ROUTES.health),
    api_health: ROUTES.api_health,
    embed: ROUTES.embed
  };

  const assetHeader = safeTextOnly(cfg0?.asset_identity?.header_name || ASSET_HDR_DEFAULT).toLowerCase();
  const hopHeaderName = safeTextOnly(cfg0?.headers?.hop_header_name || HOP_HDR_DEFAULT).toLowerCase();
  const hopHeaderValue = safeTextOnly(cfg0?.headers?.hop_header_value || HOP_VAL_DEFAULT);

  const originToAsset = { ...FALLBACK_ORIGIN_TO_ASSET };
  const map =
    cfg0?.asset_identity?.origin_to_asset_id && typeof cfg0.asset_identity.origin_to_asset_id === 'object'
      ? cfg0.asset_identity.origin_to_asset_id
      : {};
  for (const [k, v] of Object.entries(map)) {
    const o = normalizeOrigin(k);
    const id = safeTextOnly(v);
    if (o && id) originToAsset[o] = id;
  }

  let allowedList = Array.isArray(cfg0.allowedOrigins) ? cfg0.allowedOrigins : [];
  if (!allowedList.length) allowedList = Object.keys(originToAsset);
  if (!allowedList.length) allowedList = FALLBACK_ALLOWED_ORIGINS;

  const allowedOrigins = new Set(allowedList.map(normalizeOrigin).filter(Boolean));
  if (!allowedOrigins.size) {
    for (const o of FALLBACK_ALLOWED_ORIGINS) allowedOrigins.add(normalizeOrigin(o));
  }

  const parentsRaw = parseAllowedParentsJson(env);
  const defaultParents = ['https://www.gabo.services', 'https://gabo.services'];
  const allowedParents = new Set(
    (Array.isArray(parentsRaw) && parentsRaw.length ? parentsRaw : defaultParents)
      .map(normalizeOrigin)
      .filter(Boolean)
  );

  const limits = {
    max_body_chars: Number(cfg0?.limits?.max_body_chars || 8000),
    max_messages: Number(cfg0?.limits?.max_messages || 30),
    max_message_chars: Number(cfg0?.limits?.max_message_chars || 1000)
  };

  const publicOrigin = normalizeOrigin(env?.CON_ARTIST_PUBLIC_ORIGIN || 'https://con-artist.rulathemtodos.workers.dev');

  _CFG = {
    cfg_source: raw ? 'env' : 'fallback',
    routes,
    assetHeader,
    hopHeaderName,
    hopHeaderValue,
    allowedOrigins,
    allowedParents,
    originToAsset,
    limits,
    publicOrigin
  };

  return _CFG;
}

/* -------------------------
 * Security headers
 * ------------------------- */
function securityHeadersApi() {
  const h = new Headers();
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('X-Frame-Options', 'DENY');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  h.set('Cache-Control', 'no-store, no-transform');
  h.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  h.set('X-Permitted-Cross-Domain-Policies', 'none');
  h.set('X-DNS-Prefetch-Control', 'off');
  h.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
  h.set('Cross-Origin-Opener-Policy', 'same-origin');
  return h;
}

function makeNonce() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  let s = '';
  for (const b of a) s += b.toString(16).padStart(2, '0');
  return s;
}

function embedSecurityHeaders(frameAncestorsList, nonce) {
  const fa = frameAncestorsList.length ? frameAncestorsList.join(' ') : "'none'";
  const h = new Headers();
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  h.set('Cache-Control', 'no-store, no-transform');
  h.set(
    'Content-Security-Policy',
    `default-src 'none'; ` +
      `script-src 'nonce-${nonce}'; ` +
      `style-src 'nonce-${nonce}'; ` +
      `img-src 'self' data:; ` +
      `connect-src 'self'; ` +
      `base-uri 'none'; form-action 'none'; ` +
      `frame-ancestors ${fa};`
  );
  return h;
}

/* -------------------------
 * CORS (reliable)
 * ------------------------- */
function isAllowedOrigin(cfg, origin) {
  const o = normalizeOrigin(origin);
  return !!o && o !== 'null' && cfg.allowedOrigins.has(o);
}

function corsPreflightHeaders(cfg, request, origin) {
  const h = new Headers();
  const o = normalizeOrigin(origin);
  const allowed = isAllowedOrigin(cfg, o);

  if (allowed) {
    h.set('Access-Control-Allow-Origin', o);
    h.set('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  }

  h.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  const reqHdrs = request.headers.get('Access-Control-Request-Headers');
  if (reqHdrs && String(reqHdrs).trim()) h.set('Access-Control-Allow-Headers', String(reqHdrs));
  else {
    h.set(
      'Access-Control-Allow-Headers',
      ['content-type', 'accept', 'x-ops-asset-id', 'x-gabo-repo-id', 'x-gabo-parent-origin', 'x-gabo-hop'].join(', ')
    );
  }

  h.set('Access-Control-Max-Age', '86400');
  h.set('Access-Control-Expose-Headers', ['x-gabo-asset-verified', 'x-gabo-cors-debug', 'x-gabo-tenant-origin'].join(', '));
  h.set('x-gabo-cors-debug', `ok;origin_${allowed ? 'allowed' : 'denied'};cfg=${cfg.cfg_source};n=${cfg.allowedOrigins.size}`);
  return h;
}

function corsResponseHeaders(cfg, origin) {
  const h = new Headers();
  const o = normalizeOrigin(origin);
  const allowed = isAllowedOrigin(cfg, o);

  if (allowed) {
    h.set('Access-Control-Allow-Origin', o);
    h.set('Vary', 'Origin');
  }

  h.set('Access-Control-Expose-Headers', ['x-gabo-asset-verified', 'x-gabo-cors-debug', 'x-gabo-tenant-origin'].join(', '));
  h.set('x-gabo-cors-debug', `ok;origin_${allowed ? 'allowed' : 'denied'};cfg=${cfg.cfg_source};n=${cfg.allowedOrigins.size}`);
  return h;
}

function respondJson(cfg, origin, status, obj, extra) {
  const h = new Headers(extra || {});
  corsResponseHeaders(cfg, origin).forEach((v, k) => h.set(k, v));
  securityHeadersApi().forEach((v, k) => h.set(k, v));
  h.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(obj), { status, headers: h });
}

function respondSSE(cfg, origin, stream, extra) {
  const h = new Headers(extra || {});
  corsResponseHeaders(cfg, origin).forEach((v, k) => h.set(k, v));
  securityHeadersApi().forEach((v, k) => h.set(k, v));
  h.set('content-type', 'text/event-stream; charset=utf-8');
  h.set('cache-control', 'no-cache, no-transform');
  h.set('x-accel-buffering', 'no');
  return new Response(stream, { status: 200, headers: h });
}

/* -------------------------
 * Repo handshake verification
 * ------------------------- */
function verifyRepoSecret(request, env) {
  const expected = safeTextOnly(env?.CON_ARTIST_SERVICES || env?.CON_ARTIST || '');
  const got = safeTextOnly(request.headers.get(REPO_SECRET_HEADER) || '');
  if (!expected) return { ok: false, reason: 'missing_worker_secret' };
  if (!got) return { ok: false, reason: 'missing_header' };
  return timingSafeEq(got, expected) ? { ok: true } : { ok: false, reason: 'bad_secret' };
}

/* -------------------------
 * Tenant resolution + asset verification
 * ------------------------- */
function resolveTenant(cfg, request) {
  const origin = normalizeOrigin(request.headers.get('Origin') || '');
  const parent = normalizeOrigin(request.headers.get(PARENT_HDR) || '');

  if (parent) {
    if (!cfg.allowedParents.has(parent)) return { ok: false, error: 'parent_not_allowed', saw_parent: parent };
    if (!cfg.allowedOrigins.has(parent)) return { ok: false, error: 'tenant_not_allowed', saw_tenant: parent };
    return { ok: true, tenantOrigin: parent, mode: 'iframe' };
  }

  if (!origin) return { ok: false, error: 'missing_origin' };
  if (!cfg.allowedOrigins.has(origin)) return { ok: false, error: 'origin_not_allowed', saw_origin: origin };
  return { ok: true, tenantOrigin: origin, mode: 'direct' };
}

function verifyTenantAsset(cfg, tenantOrigin, request) {
  const got =
    safeTextOnly(request.headers.get(cfg.assetHeader) || '') ||
    safeTextOnly(request.headers.get(ASSET_HDR_DEFAULT) || '') ||
    safeTextOnly(request.headers.get('X-Ops-Asset-Id') || '');
  const expected = safeTextOnly(cfg.originToAsset[tenantOrigin] || '');
  return { ok: !!expected && got === expected, got, expected };
}

/* -------------------------
 * TinyML sanitation (strict, light)
 * ------------------------- */
function tinySanitize(text) {
  let out = toStr(text);
  out = out.replace(/\u0000/g, '');
  out = out.replace(/```[\s\S]*?```/g, ' [REMOVED_CODE_BLOCK] ');
  out = out.replace(/~~~[\s\S]*?~~~/g, ' [REMOVED_CODE_BLOCK] ');
  out = out.replace(/`[^`]{1,300}`/g, ' [REMOVED_INLINE_CODE] ');
  out = out.replace(/<\s*(script|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, ' ');
  out = out.replace(/<\s*(iframe|object|embed|svg|math|form|meta|link|base)\b[^>]*>/gi, ' ');
  out = out.replace(/<\/?[^>]+>/g, ' ');
  out = out.replace(/\bon\w+\s*=\s*["'][\s\S]*?["']/gi, ' ');
  out = out.replace(/\bon\w+\s*=\s*[^\s>]+/gi, ' ');
  out = out.replace(/\bjavascript\s*:/gi, '');
  out = out.replace(/\bvbscript\s*:/gi, '');
  out = out.replace(/\bdata\s*:\s*text\/html\b/gi, '');
  out = out.replace(/\b(eval|new\s+Function|setTimeout\s*\(|setInterval\s*\()\b/gi, ' [REMOVED_JS_API] ');
  out = out.replace(/\b(import|export|function|class|const|let|var|return|await|async)\b/gi, ' [REMOVED_CODE_TOKEN] ');
  out = out
    .split('\n')
    .map((line) => (/[{}\[\];=<>$]{5,}/.test(line) ? ' [REMOVED_CODE_LINE] ' : line))
    .join(' ');
  out = out.replace(/\s+/g, ' ').trim();
  return out.slice(0, 1000);
}

function tinyRisk(text) {
  const t = toStr(text);
  const hits = [
    /<\s*script\b/i,
    /<\s*style\b/i,
    /<\s*iframe\b/i,
    /<\s*(svg|math|object|embed)\b/i,
    /\bon\w+\s*=/i,
    /\bjavascript\s*:/i,
    /\bvbscript\s*:/i,
    /\bdata\s*:\s*text\/html\b/i,
    /\beval\s*\(/i,
    /\bnew\s+Function\b/i,
    /\bdocument\.(cookie|write)\b/i,
    /\bunion\s+select\b/i,
    /\bdrop\s+table\b/i,
    /\bor\s+1\s*=\s*1\b/i,
    /\b(import|export|function|class|const|let|var|return|await|async)\b/i,
    /[{}\[\];=<>$]{8,}/
  ].filter((re) => re.test(t)).length;
  return hits;
}

function tinyHasResidualMalicious(text) {
  const t = toStr(text);
  const checks = [
    /<\s*script\b/i,
    /\bon\w+\s*=/i,
    /\bjavascript\s*:/i,
    /\bvbscript\s*:/i,
    /\bdata\s*:\s*text\/html\b/i,
    /\beval\s*\(/i,
    /\bnew\s+Function\b/i,
    /\bdocument\.(cookie|write)\b/i,
    /<[^>]+>/
  ];
  return checks.some((re) => re.test(t));
}

/* -------------------------
 * Service binding call (SSE pass-through)
 * ------------------------- */
function getUpstreamBinding(env) {
  const candidates = ['DRASTIC', 'Drastic', 'drastic', 'DRASTIC_MEASURES', 'DRASTICMEASURES', 'UPSTREAM', 'Upstream', 'upstream'];

  for (const k of candidates) {
    const b = env?.[k];
    if (b && typeof b.fetch === 'function') return b;
  }
  return null;
}


function pickSharedSecret(env) {
  const a = safeTextOnly(env?.CON_ARTIST_Drastic || env?.CON_ARTIST_DRASTIC || '');
  if (a) return a;
  const b = safeTextOnly(env?.CON_ARTIST_TO_CORE_SHARED_SECRET || '');
  if (b) return b;
  return '';
}

async function forwardChatUpstream(cfg, env, tenantOrigin, tenantAssetId, payload) {
  const upstream = getUpstreamBinding(env);

  const sharedSecret = pickSharedSecret(env);
  if (!sharedSecret) throw new Error('Upstream unavailable');

  const headers = {
    'content-type': 'application/json',
    accept: 'text/event-stream',
    Origin: tenantOrigin,
    [cfg.assetHeader]: tenantAssetId,
    [CON_ARTIST_HOP_HDR]: CON_ARTIST_HOP_VAL,
    [CON_ARTIST_SECRET_HDR]: sharedSecret,
    [cfg.hopHeaderName]: cfg.hopHeaderValue
  };

  if (upstream) {
    return upstream.fetch('https://upstream/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
  }

  const fallbackUrl = safeTextOnly(env?.CON_ARTIST_UPSTREAM_URL || '');
  if (!fallbackUrl) throw new Error('Upstream unavailable');

  return fetch(`${fallbackUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
}

async function safeUpstreamErrorCode(resp) {
  const t = await resp.text().catch(() => '');
  if (!t) return '';
  try {
    const obj = JSON.parse(t);
    const e = typeof obj?.error === 'string' ? obj.error : '';
    const r = typeof obj?.reason === 'string' ? obj.reason : '';
    const code = [e, r].filter(Boolean).join(':');
    return code.replace(/https?:\/\/\S+/g, '').slice(0, 80);
  } catch {
    return '';
  }
}

/* -------------------------
 * /embed HTML (simple, secure)
 * ------------------------- */
function embedHtml({ nonce, tenantOrigin, tenantAssetId }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Chat</title>
  <style nonce="${nonce}">
    :root { color-scheme: light; }
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #fff; }
    .wrap { display: grid; grid-template-rows: 1fr auto; height: 100vh; }
    .log { padding: 12px; overflow: auto; }
    .msg { margin: 8px 0; line-height: 1.35; }
    .user { font-weight: 700; }
    .bot { font-weight: 700; }
    .bar { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 10px; border-top: 1px solid #eee; }
    input { padding: 10px; border: 1px solid #ddd; border-radius: 10px; }
    button { padding: 10px 14px; border: 0; border-radius: 10px; background: #111; color: #fff; cursor: pointer; }
    .hint { font-size: 12px; opacity: .7; padding: 0 12px 10px; }
    .bubble { white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="log" id="log">
      <div class="hint">Tenant: ${tenantOrigin}</div>
    </div>
    <div class="bar">
      <input id="q" placeholder="Ask a question…" autocomplete="off" />
      <button id="send">Send</button>
    </div>
  </div>

  <script nonce="${nonce}">
    const TENANT_ORIGIN = ${JSON.stringify(tenantOrigin)};
    const TENANT_ASSET_ID = ${JSON.stringify(tenantAssetId)};
    const log = document.getElementById('log');
    const q = document.getElementById('q');
    const send = document.getElementById('send');

    function add(label, text, cls){
      const d = document.createElement('div');
      d.className = 'msg';
      d.innerHTML = '<span class="'+cls+'">' + label + ':</span> <span class="bubble"></span>';
      d.querySelector('.bubble').textContent = String(text || '');
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d.querySelector('.bubble');
    }

    function parseSSE(block){
      const lines = String(block || '').split('\n');
      let out = '';
      for (const line of lines){
        if (line.startsWith('data:')) out += line.slice(5) + '\n';
      }
      return out;
    }

    async function ask(text){
      add('user', text, 'user');
      const botBubble = add('bot', '', 'bot');

      const payload = {
        mode: ${JSON.stringify(CON_ARTIST_MODE_IFRAME_SERVICE_QA)},
        messages: [{role:'user', content: text}],
        meta: { tenant_origin: TENANT_ORIGIN }
      };

      const resp = await fetch(${JSON.stringify(ROUTES.chat)}, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept': 'text/event-stream',
          ${JSON.stringify(PARENT_HDR)}: TENANT_ORIGIN,
          ${JSON.stringify(ASSET_HDR_DEFAULT)}: TENANT_ASSET_ID
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok){
        const t = await resp.text().catch(()=> '');
        botBubble.textContent = 'Error: ' + resp.status + ' ' + t.slice(0,240);
        return;
      }

      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buffer = '';

      while(true){
        const {value, done} = await reader.read();
        if(done) break;

        buffer += dec.decode(value, {stream:true});
        if (!buffer.includes('\n\n')) continue;

        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for(const p of parts){
          const delta = parseSSE(p);
          if(!delta) continue;
          botBubble.textContent += delta;
          log.scrollTop = log.scrollHeight;
        }
      }
    }

    send.addEventListener('click', () => {
      const text = (q.value||'').trim();
      if(!text) return;
      q.value = '';
      ask(text).catch(err => add('bot', String(err && err.message ? err.message : err), 'bot'));
    });

    q.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') send.click();
    });
  </script>
</body>
</html>`;
}

/* -------------------------
 * MAIN WORKER
 * ------------------------- */
export default {
  async fetch(request, env) {
    const cfg = buildCfg(env);
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      const h = corsPreflightHeaders(cfg, request, origin);
      securityHeadersApi().forEach((v, k) => h.set(k, v));
      return new Response(null, { status: 204, headers: h });
    }

    if (url.pathname === '/' || url.pathname === cfg.routes.health || url.pathname === cfg.routes.api_health) {
      const upstreamPresent = !!getUpstreamBinding(env);
      return respondJson(cfg, origin, 200, {
        ok: true,
        health: 'gateway: ok',
        cfg_source: cfg.cfg_source,
        allowed_origins_count: cfg.allowedOrigins.size,
        allowed_parents_count: cfg.allowedParents.size,
        public_origin: cfg.publicOrigin,
        upstream_binding: upstreamPresent ? 'present' : 'missing'
      });
    }

    if (request.method === 'GET' && url.pathname === cfg.routes.chat) {
      const upstreamPresent = !!getUpstreamBinding(env);
      return respondJson(cfg, origin, 200, {
        ok: true,
        routes: { ...cfg.routes, handshake: REPO_HANDSHAKE_PATH },
        allowed_origins: Array.from(cfg.allowedOrigins),
        allowed_parents: Array.from(cfg.allowedParents),
        asset_header: cfg.assetHeader,
        handshake: { method: 'POST', path: REPO_HANDSHAKE_PATH, header: REPO_SECRET_HEADER, secret_env: 'CON_ARTIST_SERVICES' },
        upstream_binding: upstreamPresent ? 'present' : 'missing',
        note: 'This endpoint streams SSE on POST.'
      });
    }

    if (url.pathname === REPO_HANDSHAKE_PATH) {
      if (request.method !== 'POST') return respondJson(cfg, origin, 405, { ok: false, error: 'method_not_allowed' });
      const check = verifyRepoSecret(request, env);
      if (!check.ok) return respondJson(cfg, origin, 403, { ok: false, error: 'repo_auth_failed', reason: check.reason });
      return respondJson(cfg, origin, 200, { ok: true, match: 'repo<->worker', worker: 'con-artist' });
    }

    if (url.pathname === cfg.routes.embed) {
      const parent = normalizeOrigin(url.searchParams.get('parent') || '');
      if (!parent) return new Response('Missing ?parent=', { status: 400, headers: { 'content-type': 'text/plain; charset=utf-8' } });
      if (!cfg.allowedParents.has(parent)) return new Response('Parent not allowed', { status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } });

      const tenantAssetId = safeTextOnly(cfg.originToAsset[parent] || '');
      if (!tenantAssetId) return new Response('Missing tenant asset mapping', { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } });

      const nonce = makeNonce();
      const frameAncestors = Array.from(cfg.allowedParents);

      const h = embedSecurityHeaders(frameAncestors, nonce);
      h.set('content-type', 'text/html; charset=utf-8');
      return new Response(embedHtml({ nonce, tenantOrigin: parent, tenantAssetId }), { status: 200, headers: h });
    }

    if (url.pathname !== cfg.routes.chat) return respondJson(cfg, origin, 404, { ok: false, error: 'not_found' });
    if (request.method !== 'POST') return respondJson(cfg, origin, 405, { ok: false, error: 'method_not_allowed' });

    const tenant = resolveTenant(cfg, request);
    if (!tenant.ok) return respondJson(cfg, origin, 403, { ok: false, error: 'tenant_rejected', detail: tenant });

    const assetCheck = verifyTenantAsset(cfg, tenant.tenantOrigin, request);
    if (!assetCheck.ok) {
      return respondJson(cfg, origin, 403, {
        ok: false,
        error: 'invalid_asset_identity',
        tenant_origin: tenant.tenantOrigin,
        got_asset_id: assetCheck.got || '(none)',
        expected_asset_id: assetCheck.expected || '(missing mapping)'
      });
    }

    if (tenant.mode === 'direct') {
      if (!isAllowedOrigin(cfg, origin)) {
        return respondJson(cfg, origin, 403, { ok: false, error: 'origin_not_allowed', saw_origin: origin || '(none)' });
      }
    }

    const raw = await request.text().catch(() => '');
    if (!raw) return respondJson(cfg, origin, 400, { ok: false, error: 'empty_body' });
    if (raw.length > cfg.limits.max_body_chars) return respondJson(cfg, origin, 413, { ok: false, error: 'request_too_large' });

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return respondJson(cfg, origin, 400, { ok: false, error: 'invalid_json' });
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const normalizedMessages = [];

    for (const msg of messages.slice(-cfg.limits.max_messages)) {
      if (!msg || typeof msg !== 'object') continue;
      const role = String(msg.role || '').toLowerCase();
      if (role !== 'user' && role !== 'assistant') continue;

      const content = tinySanitize(msg.content || '');
      const risk = tinyRisk(content);
      if (!content || risk >= 2 || tinyHasResidualMalicious(content)) {
        return respondJson(cfg, origin, 403, { ok: false, error: 'blocked_by_tinyml' });
      }

      let clipped = safeTextOnly(content);
      if (clipped.length > cfg.limits.max_message_chars) clipped = clipped.slice(0, cfg.limits.max_message_chars);
      if (clipped) normalizedMessages.push({ role, content: clipped });
    }

    if (!normalizedMessages.length) return respondJson(cfg, origin, 400, { ok: false, error: 'messages_required' });

    const payload = {
      mode: CON_ARTIST_MODE_IFRAME_SERVICE_QA,
      messages: normalizedMessages,
      meta: body.meta && typeof body.meta === 'object' ? body.meta : {}
    };

    let upstreamResp;
    try {
      upstreamResp = await forwardChatUpstream(cfg, env, tenant.tenantOrigin, assetCheck.got, payload);
    } catch {
      return respondJson(cfg, origin, 502, { ok: false, error: 'upstream_unreachable' });
    }

    if (!upstreamResp.ok) {
      const code = await safeUpstreamErrorCode(upstreamResp);
      return respondJson(cfg, origin, 502, { ok: false, error: 'upstream_error', status: upstreamResp.status, code: code || undefined });
    }

    const extra = new Headers();
    extra.set('x-gabo-asset-verified', '1');
    extra.set('x-gabo-tenant-origin', tenant.tenantOrigin);

    return respondSSE(cfg, origin, upstreamResp.body, extra);
  }
};
