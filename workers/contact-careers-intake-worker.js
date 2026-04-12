/**
 * Cloudflare Worker (repo worker)
 *
 * Intake routes:
 * - POST /api/intake/contact  (legacy: /submit/contact)
 * - POST /api/intake/careers  (legacy: /submit/careers)
 *
 * Routing rules (secret asset IDs):
 * - Contact -> Gmail  -> ASSET_C5T
 * - Careers -> GSheets -> ASSET_C5S
 */

const DEFAULT_UPSTREAM_URL = 'https://solitary-term-4203.rulathemtodos.workers.dev/intake';
const CODE_SIGNATURE_PATTERN = /(javascript:|data:text\/html|vbscript:|<script|<iframe|onerror\s*=|onload\s*=|function\s*\(|=>|\beval\b|document\.cookie|localStorage|sessionStorage|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bCREATE\b|\bALTER\b|\{\{|\}\}|<\?|\?>)/gi;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: buildCorsHeaders(request, env) });
    }

    const url = new URL(request.url);
    const route = resolveRoute(url.pathname);
    if (!route) {
      return json({ ok: false, error: 'Route not found.' }, 404, request, env);
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'Method not allowed.' }, 405, request, env);
    }

    const config = resolveDestinationConfig(route, env);
    if (!config.ok) {
      return json({ ok: false, error: config.error }, 500, request, env);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ ok: false, error: 'Expected JSON body.' }, 400, request, env);
    }

    const sanitized = sanitizePayload(payload);
    if (!sanitized.accepted) {
      return json(
        { ok: false, error: 'Payload rejected: only plain, safe text is accepted.', rejectedFields: sanitized.scan.rejectedFields },
        422,
        request,
        env
      );
    }

    const upstream = env.UPSTREAM_WORKER_URL || DEFAULT_UPSTREAM_URL;
    const relayPayload = {
      source: route,
      destination: config.channel,
      asset: config.asset,
      receivedAt: new Date().toISOString(),
      clean: sanitized.data,
      scan: sanitized.scan
    };

    const relayResponse = await fetch(upstream, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-intake-source': route,
        'x-intake-channel': config.channel,
        'x-intake-asset': config.asset
      },
      body: JSON.stringify(relayPayload)
    });

    if (!relayResponse.ok) {
      const detail = (await relayResponse.text()).slice(0, 280);
      return json({ ok: false, error: `Upstream relay failed (${relayResponse.status}).`, detail }, 502, request, env);
    }

    return json({ ok: true, source: route, destination: config.channel, forwarded: true }, 200, request, env);
  }
};

function resolveRoute(pathname) {
  if (pathname === '/api/intake/contact' || pathname === '/submit/contact') return 'contact';
  if (pathname === '/api/intake/careers' || pathname === '/submit/careers') return 'careers';
  return null;
}

function resolveDestinationConfig(route, env) {
  if (route === 'contact') {
    if (!env.ASSET_C5T) return { ok: false, error: 'Missing secret ASSET_C5T.' };
    return { ok: true, channel: 'gmail', asset: env.ASSET_C5T };
  }
  if (route === 'careers') {
    if (!env.ASSET_C5S) return { ok: false, error: 'Missing secret ASSET_C5S.' };
    return { ok: true, channel: 'gsheets', asset: env.ASSET_C5S };
  }
  return { ok: false, error: 'Unsupported route.' };
}

function sanitizePayload(input) {
  const scan = {
    removedTags: 0,
    removedCodeLike: 0,
    normalizedFields: 0,
    rejectedFields: []
  };

  const source = input && typeof input === 'object' ? input : {};
  const out = {};

  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      const arr = value.map((v) => sanitizeText(v, key, scan)).filter(Boolean);
      out[key] = arr;
      continue;
    }

    out[key] = sanitizeText(value, key, scan);
  }

  return { accepted: scan.rejectedFields.length === 0, data: out, scan };
}

function sanitizeText(value, key, scan) {
  let text = String(value ?? '');
  const original = text;

  text = text.replace(/<[^>]*>/g, () => {
    scan.removedTags += 1;
    return ' ';
  });

  text = text.replace(CODE_SIGNATURE_PATTERN, () => {
    scan.removedCodeLike += 1;
    return ' ';
  });

  text = text.replace(/[^\p{L}\p{N}\s.,;:!?@#%&()\-_/+'"\n]/gu, ' ');
  text = text.replace(/\s{2,}/g, ' ').trim();

  if (isSuspicious(original, text)) {
    scan.rejectedFields.push(key);
  }

  if (text !== original) {
    scan.normalizedFields += 1;
  }

  return text;
}

function isSuspicious(before, after) {
  const symbolHits = (before.match(/[{}<>;$`=\\]/g) || []).length;
  if (symbolHits >= 6) return true;

  const codeTokenHits = (before.match(/(function\s*\(|=>|<script|SELECT\s+|DROP\s+|\{\{|\}\}|<\?)/gi) || []).length;
  if (codeTokenHits > 0) return true;

  return after.length === 0 && before.trim().length > 0;
}

function json(payload, status, request, env) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...buildCorsHeaders(request, env)
    }
  });
}

function buildCorsHeaders(request, env) {
  const origin = request.headers.get('origin') || '';
  const allowlist = (env.ALLOWED_ORIGINS || 'https://www.gabo.services,https://gabo.services')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  const allowedOrigin = allowlist.includes(origin) ? origin : allowlist[0] || '*';

  return {
    'access-control-allow-origin': allowedOrigin,
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'origin'
  };
}
