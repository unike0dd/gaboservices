const ROUTES = {
  health: "/health",
  debugConfig: "/debug/config",
  contact: "/contact",
  careers: "/careers",
};

const DEFAULT_ALLOWED_ORIGINS = "https://www.gabo.services,https://gabo.services";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = String(request.method || "GET").toUpperCase();
    const path = normalizePath(url.pathname);

    if (method === "OPTIONS" && isCorsPath(path)) {
      return new Response(null, {
        status: 204,
        headers: {
          ...buildCorsHeaders(request, env),
          ...buildSecurityHeaders(),
        },
      });
    }

    if (method === "GET" && path === ROUTES.health) {
      return jsonResponse(
        {
          ok: true,
          worker: "correo-paginas",
          routes: [ROUTES.health, ROUTES.debugConfig, ROUTES.contact, ROUTES.careers],
        },
        200,
        request,
        env
      );
    }

    if (method === "GET" && path === ROUTES.debugConfig) {
      return jsonResponse(
        {
          ok: true,
          worker: "correo-paginas",
          hasAppsScriptUrl: Boolean(String(env.APPS_SCRIPT_BRIDGE_URL || "").trim()),
          hasBridgeToken: Boolean(String(env.APPS_SCRIPT_BRIDGE_TOKEN || "").trim()),
          hasSharedSecret: Boolean(String(env.SOLITARY_TO_CORREO_SHARED_SECRET || "").trim()),
          allowedOriginsCount: getAllowedOrigins(env).length,
          routeTablePresent: true,
        },
        200,
        request,
        env
      );
    }

    if (method !== "POST") {
      return jsonResponse(
        { ok: false, stage: "route", error: "Method not allowed." },
        405,
        request,
        env
      );
    }

    const routeKey = resolveRoute(path);
    if (!routeKey) {
      return jsonResponse({ ok: false, stage: "route", error: "Not found." }, 404, request, env);
    }

    const sharedSecret = String(env.SOLITARY_TO_CORREO_SHARED_SECRET || "").trim();
    if (!sharedSecret) {
      return jsonResponse(
        { ok: false, stage: "validation", error: "Missing SOLITARY_TO_CORREO_SHARED_SECRET." },
        500,
        request,
        env
      );
    }

    const incomingSecret = String(request.headers.get("x-solitary-bridge-secret") || "").trim();
    if (!safeEqual(incomingSecret, sharedSecret)) {
      return jsonResponse(
        { ok: false, stage: "validation", error: "Unauthorized bridge request." },
        403,
        request,
        env
      );
    }

    if (!String(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) {
      return jsonResponse(
        { ok: false, stage: "validation", error: "Expected application/json." },
        415,
        request,
        env
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      logFailure("parse", "invalid json body", { message: String(error?.message || error) });
      return jsonResponse(
        { ok: false, stage: "parse", error: "Invalid JSON body." },
        400,
        request,
        env
      );
    }

    const appsScriptUrl = String(env.APPS_SCRIPT_BRIDGE_URL || "").trim();
    const bridgeToken = String(env.APPS_SCRIPT_BRIDGE_TOKEN || "").trim();

    if (!appsScriptUrl) {
      return jsonResponse(
        { ok: false, stage: "upstream_config", error: "Missing APPS_SCRIPT_BRIDGE_URL." },
        500,
        request,
        env
      );
    }

    if (!bridgeToken) {
      return jsonResponse(
        { ok: false, stage: "upstream_config", error: "Missing APPS_SCRIPT_BRIDGE_TOKEN." },
        500,
        request,
        env
      );
    }

    let upstreamResponse;
    try {
      upstreamResponse = await fetchWithTimeout(appsScriptUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-apps-script-bridge-token": bridgeToken,
          "x-gabo-hop": "correo-paginas",
          "x-solitary-route": routeKey,
        },
        body: JSON.stringify(body),
      }, env);
    } catch (error) {
      logFailure("upstream_fetch", "apps script fetch failed", {
        route: routeKey,
        message: String(error?.message || error),
      });
      return jsonResponse(
        { ok: false, stage: "upstream_fetch", error: "Apps Script fetch failed." },
        502,
        request,
        env
      );
    }

    const upstreamStatus = upstreamResponse.status;
    const upstreamText = await safeReadText(upstreamResponse);
    const upstreamJson = tryParseJson(upstreamText);

    if (!upstreamJson) {
      logFailure("apps_script", "non-json response", { status: upstreamStatus, route: routeKey });
      return jsonResponse(
        {
          ok: false,
          stage: "apps_script",
          error: "Apps Script returned non-JSON response.",
          upstreamStatus,
        },
        upstreamResponse.ok ? 502 : upstreamStatus,
        request,
        env
      );
    }

    if (!upstreamResponse.ok) {
      logFailure("upstream_status", "apps script non-2xx", { status: upstreamStatus, route: routeKey });
      return jsonResponse(
        {
          ok: false,
          stage: "upstream_status",
          error: `Apps Script returned ${upstreamStatus}.`,
          upstreamStatus,
          upstream: upstreamJson,
        },
        upstreamStatus,
        request,
        env
      );
    }

    return jsonResponse(
      {
        ok: true,
        route: routeKey,
        upstreamStatus,
        upstream: upstreamJson,
      },
      200,
      request,
      env
    );
  },
};

function resolveRoute(path) {
  if (path === ROUTES.contact) return "contact";
  if (path === ROUTES.careers) return "careers";
  return "";
}

function isCorsPath(path) {
  return [ROUTES.health, ROUTES.debugConfig, ROUTES.contact, ROUTES.careers].includes(path);
}

function normalizePath(pathname) {
  const raw = String(pathname || "").trim();
  const withSlash = raw ? (raw.startsWith("/") ? raw : `/${raw}`) : "/";
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
}

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildCorsHeaders(request, env) {
  const allowlist = getAllowedOrigins(env);
  const origin = String(request.headers.get("origin") || "");
  const allowedOrigin = allowlist.includes(origin) ? origin : allowlist[0] || "https://www.gabo.services";

  return {
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type, x-ops-asset-id",
    "access-control-max-age": "86400",
    vary: "origin, access-control-request-headers",
    "cache-control": "no-store",
  };
}

function buildSecurityHeaders() {
  return {
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
    "cache-control": "no-store",
  };
}

function jsonResponse(payload, status, request, env) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...buildCorsHeaders(request, env),
      ...buildSecurityHeaders(),
    },
  });
}

async function fetchWithTimeout(url, options, env) {
  const controller = new AbortController();
  const timeoutMs = Number(env.UPSTREAM_TIMEOUT_MS || 10000);
  const timeout = setTimeout(() => controller.abort("upstream timeout"), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function safeEqual(a, b) {
  const aa = String(a || "");
  const bb = String(b || "");
  const max = Math.max(aa.length, bb.length);
  let mismatch = aa.length ^ bb.length;

  for (let i = 0; i < max; i += 1) {
    mismatch |= (aa.charCodeAt(i) || 0) ^ (bb.charCodeAt(i) || 0);
  }

  return mismatch === 0;
}

function logFailure(stage, message, meta = {}) {
  console.error(
    JSON.stringify({
      ok: false,
      worker: "correo-paginas",
      stage,
      error: message,
      ...meta,
    })
  );
}
