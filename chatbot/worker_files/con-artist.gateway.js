/**
 * con-artist.gateway.js — Cloudflare Worker GATEWAY (Direct con-artist upstream)
 *
 * Primary gateway endpoint: https://con-artist.rulathemtodos.workers.dev/
 *
 * Capabilities:
 * - CORS preflight + strict origin allowlist
 * - Repo handshake: POST /__repo/handshake with x-gabo-repo-id === env.CON_ARTIST
 * - TinyML input sanitation before forwarding
 * - Direct forwarding to Cloudflare upstream (SSE pass-through)
 *
 * Required bindings:
 * - None for proxy mode
 */

const FALLBACK_ALLOWED_ORIGINS = [
  'https://www.gabo.services',
  'https://gabo.services',
  'https://chattiavato-a11y.github.io',
  'https://con-artist.rulathemtodos.workers.dev'
];

const REPO_SECRET_HEADER = 'x-gabo-repo-id';
const REPO_HANDSHAKE_PATH = '/__repo/handshake';
const ASSET_HEADER = 'x-ops-asset-id';
const HOP_HEADER = 'x-gabo-hop';
const HOP_VALUE = 'gateway';
const DEFAULT_UPSTREAM = 'https://con-artist.rulathemtodos.workers.dev';

const CHAT_ROUTE = '/api/chat';
const HEALTH_ROUTE = '/health';

function toStr(v) {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

function safeText(v) {
  return toStr(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
}

function normalizeOrigin(value) {
  const raw = safeText(value);
  if (!raw) return '';
  try {
    return new URL(raw).origin.toLowerCase();
  } catch {
    return raw.replace(/\/$/, '').toLowerCase();
  }
}

function timingSafeEq(a, b) {
  const x = toStr(a);
  const y = toStr(b);
  if (x.length !== y.length) return false;
  let out = 0;
  for (let i = 0; i < x.length; i++) out |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return out === 0;
}

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

function buildCfg(env) {
  let envCfg = {};
  if (env?.ORIGIN_ASSET_ID_JSON) {
    try {
      envCfg = typeof env.ORIGIN_ASSET_ID_JSON === 'string'
        ? JSON.parse(env.ORIGIN_ASSET_ID_JSON)
        : env.ORIGIN_ASSET_ID_JSON;
    } catch {
      envCfg = {};
    }
  }

  const map = envCfg?.asset_identity?.origin_to_asset_id || envCfg?.origin_to_asset_id || {};
  const originToAsset = {};
  for (const [origin, assetId] of Object.entries(map)) {
    const n = normalizeOrigin(origin);
    if (n && safeText(assetId)) originToAsset[n] = safeText(assetId);
  }

  const conArtistSecret = safeText(env?.CON_ARTIST || '');
  const defaultGatewayOrigin = normalizeOrigin(DEFAULT_UPSTREAM);
  if (conArtistSecret && defaultGatewayOrigin) {
    originToAsset[defaultGatewayOrigin] = conArtistSecret;
  }

  const allowed = Array.isArray(envCfg.allowedOrigins) && envCfg.allowedOrigins.length
    ? envCfg.allowedOrigins
    : Object.keys(originToAsset).length
      ? Object.keys(originToAsset)
      : FALLBACK_ALLOWED_ORIGINS;

  return {
    allowedOrigins: new Set(allowed.map(normalizeOrigin).filter(Boolean)),
    originToAsset,
    maxBodyChars: Number(envCfg?.limits?.max_body_chars || 8000)
  };
}

function corsHeaders(cfg, request, origin) {
  const h = new Headers();
  const n = normalizeOrigin(origin);
  const allowed = n && cfg.allowedOrigins.has(n);

  if (allowed) {
    h.set('Access-Control-Allow-Origin', n);
    h.set('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  }

  h.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  h.set('Access-Control-Allow-Headers', request.headers.get('Access-Control-Request-Headers') || 'content-type, accept, x-ops-asset-id, x-gabo-repo-id');
  h.set('Access-Control-Expose-Headers', 'x-gabo-asset-verified, x-gabo-cors-debug, x-gabo-lang-iso2, x-gabo-model');
  h.set('Access-Control-Max-Age', '86400');
  h.set('x-gabo-cors-debug', `origin_${allowed ? 'allowed' : 'denied'}`);
  return h;
}

function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()',
    'Cache-Control': 'no-store, no-transform',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
  };
}

function json(cfg, request, origin, status, payload, extra = {}) {
  const headers = new Headers({
    ...securityHeaders(),
    ...extra,
    'content-type': 'application/json; charset=utf-8'
  });
  corsHeaders(cfg, request, origin).forEach((v, k) => headers.set(k, v));
  return new Response(JSON.stringify(payload), { status, headers });
}

async function forwardChatToUpstream(cfg, env, origin, assetId, payload) {
  const upstreamUrl = `${DEFAULT_UPSTREAM}${CHAT_ROUTE}`;

  return fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'text/event-stream',
      Origin: normalizeOrigin(origin) || DEFAULT_UPSTREAM,
      [ASSET_HEADER]: assetId,
      [HOP_HEADER]: HOP_VALUE
    },
    body: JSON.stringify(payload)
  });
}

export default {
  async fetch(request, env) {
    const cfg = buildCfg(env);
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      const headers = corsHeaders(cfg, request, origin);
      Object.entries(securityHeaders()).forEach(([k, v]) => headers.set(k, v));
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === '/' || url.pathname === HEALTH_ROUTE || url.pathname === '/api/health') {
      return json(cfg, request, origin, 200, {
        ok: true,
        health: 'gateway: ok',
        worker: 'con-artist',
        allowed_origins_count: cfg.allowedOrigins.size
      });
    }

    if (url.pathname === REPO_HANDSHAKE_PATH) {
      if (request.method !== 'POST') return json(cfg, request, origin, 405, { ok: false, error: 'method_not_allowed' });
      const expected = safeText(env?.CON_ARTIST || '');
      const got = safeText(request.headers.get(REPO_SECRET_HEADER) || '');
      if (!expected || !got || !timingSafeEq(got, expected)) {
        return json(cfg, request, origin, 403, { ok: false, error: 'repo_auth_failed' });
      }
      return json(cfg, request, origin, 200, {
        ok: true,
        worker: 'con-artist',
        upstream: DEFAULT_UPSTREAM
      });
    }

    if (url.pathname !== CHAT_ROUTE || request.method !== 'POST') {
      return json(cfg, request, origin, 404, { ok: false, error: 'not_found' });
    }

    const normalizedOrigin = normalizeOrigin(origin);
    if (!normalizedOrigin || !cfg.allowedOrigins.has(normalizedOrigin)) {
      return json(cfg, request, origin, 403, { ok: false, error: 'origin_not_allowed', saw_origin: origin || '(none)' });
    }

    const expectedAsset = safeText(cfg.originToAsset[normalizedOrigin] || '');
    const gotAsset = safeText(request.headers.get(ASSET_HEADER) || '');
    if (!expectedAsset || !gotAsset || gotAsset !== expectedAsset) {
      return json(cfg, request, origin, 403, {
        ok: false,
        error: 'invalid_asset_identity',
        expected_asset_id: expectedAsset || '(missing mapping)'
      });
    }

    const raw = await request.text();
    if (!raw) return json(cfg, request, origin, 400, { ok: false, error: 'empty_body' });
    if (raw.length > cfg.maxBodyChars) return json(cfg, request, origin, 413, { ok: false, error: 'request_too_large' });

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json(cfg, request, origin, 400, { ok: false, error: 'invalid_json' });
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const normalizedMessages = [];
    for (const msg of messages.slice(-30)) {
      if (!msg || typeof msg !== 'object') continue;
      const role = String(msg.role || '').toLowerCase();
      if (role !== 'user' && role !== 'assistant') continue;
      const content = tinySanitize(msg.content || '');
      const risk = tinyRisk(content);
      if (!content || risk >= 2 || tinyHasResidualMalicious(content)) {
        return json(cfg, request, origin, 403, { ok: false, error: 'blocked_by_tinyml' });
      }
      normalizedMessages.push({ role, content });
    }

    if (!normalizedMessages.length) {
      return json(cfg, request, origin, 400, { ok: false, error: 'messages_required' });
    }

    let upstreamResp;
    try {
      upstreamResp = await forwardChatToUpstream(cfg, env, origin, gotAsset, {
        messages: normalizedMessages,
        meta: body.meta && typeof body.meta === 'object' ? body.meta : {}
      });
    } catch (err) {
      return json(cfg, request, origin, 502, { ok: false, error: 'upstream_unreachable', detail: safeText(err?.message || err) });
    }

    if (!upstreamResp.ok) {
      const detail = (await upstreamResp.text().catch(() => '')).slice(0, 2000);
      return json(cfg, request, origin, 502, { ok: false, error: 'upstream_error', status: upstreamResp.status, detail });
    }

    const headers = new Headers({
      ...securityHeaders(),
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
      'x-gabo-asset-verified': '1'
    });
    corsHeaders(cfg, request, origin).forEach((v, k) => headers.set(k, v));

    ['x-gabo-lang-iso2', 'x-gabo-model', 'x-gabo-translated', 'x-gabo-embeddings'].forEach((key) => {
      const value = upstreamResp.headers.get(key);
      if (value) headers.set(key, value);
    });

    return new Response(upstreamResp.body, { status: 200, headers });
  }
};
