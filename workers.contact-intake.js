const ROUTES = { health: '/health', debugConfig: '/debug/config', submit: '/contact' };
const DEFAULT_ALLOWED_ORIGINS = 'https://www.gabo.services,https://gabo.services';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const path = normalizePath(url.pathname);

    if (method === 'OPTIONS' && isCorsPath(path)) {
      return new Response(null, { status: 204, headers: { ...buildCorsHeaders(request, env), ...buildSecurityHeaders() } });
    }
    if (method === 'GET' && path === ROUTES.health) {
      return jsonResponse({ ok: true, worker: 'contact-intake', routes: Object.values(ROUTES) }, 200, request, env);
    }
    if (method === 'GET' && path === ROUTES.debugConfig) {
      return jsonResponse({ ok: true, worker: 'contact-intake', hasAppsScriptUrl: Boolean(String(env.APPS_SCRIPT_BRIDGE_URL || '').trim()), hasBridgeToken: Boolean(String(env.APPS_SCRIPT_BRIDGE_TOKEN || '').trim()), hasSharedSecret: Boolean(String(env.SOLITARY_TO_CORREO_SHARED_SECRET || '').trim()), allowedOriginsCount: getAllowedOrigins(env).length }, 200, request, env);
    }
    if (method !== 'POST' || path !== ROUTES.submit) {
      return jsonResponse({ ok: false, stage: 'route', error: 'Not found.' }, 404, request, env);
    }
    return proxyUpstream(request, env, 'contact');
  }
};

async function proxyUpstream(request, env, routeKey) {
  const sharedSecret = String(env.SOLITARY_TO_CORREO_SHARED_SECRET || '').trim();
  if (!sharedSecret || !safeEqual(String(request.headers.get('x-solitary-bridge-secret') || '').trim(), sharedSecret)) {
    return jsonResponse({ ok: false, stage: 'validation', error: 'Unauthorized bridge request.' }, 403, request, env);
  }
  if (!String(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    return jsonResponse({ ok: false, stage: 'validation', error: 'Expected application/json.' }, 415, request, env);
  }
  const body = await request.json().catch(() => null);
  if (!body) return jsonResponse({ ok: false, stage: 'parse', error: 'Invalid JSON body.' }, 400, request, env);

  const appsScriptUrl = String(env.APPS_SCRIPT_BRIDGE_URL || '').trim();
  const bridgeToken = String(env.APPS_SCRIPT_BRIDGE_TOKEN || '').trim();
  if (!appsScriptUrl || !bridgeToken) return jsonResponse({ ok: false, stage: 'upstream_config', error: 'Missing Apps Script bridge config.' }, 500, request, env);

  const upstream = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8', 'x-apps-script-bridge-token': bridgeToken, 'x-gabo-hop': 'contact-intake', 'x-solitary-route': routeKey },
    body: JSON.stringify(body)
  }).catch(() => null);

  if (!upstream) return jsonResponse({ ok: false, stage: 'upstream_fetch', error: 'Apps Script fetch failed.' }, 502, request, env);
  const text = await upstream.text();
  const json = tryParseJson(text);
  if (!json) return jsonResponse({ ok: false, stage: 'apps_script', error: 'Apps Script returned non-JSON response.', upstreamStatus: upstream.status }, upstream.ok ? 502 : upstream.status, request, env);
  if (!upstream.ok) return jsonResponse({ ok: false, stage: 'upstream_status', error: `Apps Script returned ${upstream.status}.`, upstreamStatus: upstream.status, upstream: json }, upstream.status, request, env);
  return jsonResponse({ ok: true, route: routeKey, upstreamStatus: upstream.status, upstream: json }, 200, request, env);
}

function tryParseJson(v) { try { return JSON.parse(v); } catch { return null; } }
function normalizePath(pathname) { const p = String(pathname || '').trim(); return p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : (p.startsWith('/') ? p : `/${p || ''}`); }
function isCorsPath(path) { return Object.values(ROUTES).includes(path); }
function getAllowedOrigins(env) { return String(env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS).split(',').map((v) => v.trim()).filter(Boolean); }
function buildCorsHeaders(request, env) { const allowlist = getAllowedOrigins(env); const origin = String(request.headers.get('origin') || ''); const allow = allowlist.includes(origin) ? origin : allowlist[0] || 'https://www.gabo.services'; return { 'access-control-allow-origin': allow, 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type,x-solitary-bridge-secret', 'access-control-max-age': '86400', vary: 'Origin' }; }
function buildSecurityHeaders() { return { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload', 'X-Frame-Options': 'DENY', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-XSS-Protection': '0', 'Cache-Control': 'no-store' }; }
function jsonResponse(body, status, request, env) { return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...buildCorsHeaders(request, env), ...buildSecurityHeaders() } }); }
function safeEqual(a, b) { if (a.length !== b.length) return false; let out = 0; for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i); return out === 0; }
