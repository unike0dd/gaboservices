const DEFAULT_UPSTREAM_URL = "https://solitary-term-4203.rulathemtodos.workers.dev/ingest";

const CODE_SIGNATURE_PATTERN =
  /(javascript:|data:text\/html|vbscript:|<script|<iframe|<object|<embed|onerror\s*=|onload\s*=|onclick\s*=|function\s*\(|=>|\beval\b|document\.cookie|localStorage|sessionStorage|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bCREATE\b|\bALTER\b|\{\{|\}\}|<\?|\?>)/gi;
const HONEYPOT_FIELDS = [
  "company_website",
  "portfolio_url",
  "website",
  "url",
  "fax_number",
  "middle_name",
];
const RATE_LIMIT_STATE = new Map();

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(request, env),
      });
    }

    const url = new URL(request.url);
    const route = resolveRoute(url.pathname);

    if (!route) {
      return json({ ok: false, error: "Route not found." }, 404, request, env);
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed." }, 405, request, env);
    }

    if (!originAllowed(request, env)) {
      return json({ ok: false, error: "Origin not allowed." }, 403, request, env);
    }

    const rateLimit = applyRateLimit(route, request, env);
    if (rateLimit.blocked) {
      return json(
        {
          ok: false,
          error: "Too many submissions. Please wait and try again.",
          code: "rate_limited",
        },
        429,
        request,
        env,
        {
          "retry-after": String(rateLimit.retryAfterSeconds),
        }
      );
    }

    const config = resolveDestinationConfig(route, env);
    if (!config.ok) {
      return json({ ok: false, error: config.error }, 500, request, env);
    }

    let payload;
    try {
      payload = await parseIncomingBody(request);
    } catch {
      return json(
        {
          ok: false,
          error: "Expected JSON, form-urlencoded, or multipart form fields.",
        },
        400,
        request,
        env
      );
    }

    if (honeypotTriggered(payload)) {
      return json({ ok: false, error: "Submission blocked." }, 403, request, env);
    }

    const abuseSignals = detectAbuseSignals(payload, request, route, env);
    if (!abuseSignals.accepted) {
      return json(
        {
          ok: false,
          error: "Submission blocked by abuse protection.",
          code: abuseSignals.code,
        },
        403,
        request,
        env
      );
    }

    const turnstileToken = extractTurnstileToken(payload);
    const enforceTurnstile = shouldEnforceTurnstile(env);
    if (enforceTurnstile && !turnstileToken) {
      return json(
        {
          ok: false,
          error: "Missing Turnstile token.",
          code: "turnstile_token_missing",
        },
        403,
        request,
        env
      );
    }

    const sanitized = sanitizePayload(stripTurnstileFields(payload));

    if (!sanitized.accepted) {
      return json(
        {
          ok: false,
          error: "Payload rejected: only plain, safe text is accepted.",
          rejectedFields: sanitized.scan.rejectedFields,
        },
        422,
        request,
        env
      );
    }

    const upstream = (env.UPSTREAM_WORKER_URL || DEFAULT_UPSTREAM_URL).trim();

    const relayResponse = await fetch(upstream, {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-ops-asset-id": config.asset,
      },
      body: JSON.stringify({
        ...sanitized.data,
        ...(turnstileToken ? { turnstileToken } : {}),
      }),
    });

    if (!relayResponse.ok) {
      const detail = (await safeReadText(relayResponse)).slice(0, 400);
      return json(
        {
          ok: false,
          error: `Upstream relay failed (${relayResponse.status}).`,
          detail,
        },
        502,
        request,
        env
      );
    }

    return json(
      {
        ok: true,
        source: route,
        destination: config.channel,
        forwarded: true,
      },
      200,
      request,
      env
    );
  },
};

function resolveRoute(pathname) {
  if (pathname === "/api/intake/contact" || pathname === "/submit/contact") {
    return "contact";
  }

  if (pathname === "/api/intake/careers" || pathname === "/submit/careers") {
    return "careers";
  }

  return null;
}

function honeypotTriggered(payload) {
  if (!payload || typeof payload !== "object") return false;
  return HONEYPOT_FIELDS.some((key) => String(payload[key] || "").trim().length > 0);
}

function detectAbuseSignals(payload, request, route, env) {
  const source =
    payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const entries = Object.entries(source);
  const maxFieldCount = readIntEnv(env.ABUSE_MAX_FIELD_COUNT, 70, 20, 200);
  if (entries.length > maxFieldCount) {
    return { accepted: false, code: "abuse_fields_excessive" };
  }

  const maxFieldLength = readIntEnv(env.ABUSE_MAX_FIELD_LENGTH, 5000, 500, 12000);
  const maxUrlCount = readIntEnv(env.ABUSE_MAX_URLS, 4, 0, 20);
  let urlCount = 0;

  for (const [, value] of entries) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      const text = String(item || "");
      if (text.length > maxFieldLength) {
        return { accepted: false, code: "abuse_field_too_long" };
      }
      if (/(.)\1{24,}/.test(text)) {
        return { accepted: false, code: "abuse_repetitive_pattern" };
      }
      urlCount += (text.match(/https?:\/\//gi) || []).length;
      if (urlCount > maxUrlCount) {
        return { accepted: false, code: "abuse_excessive_links" };
      }
    }
  }

  const requiredByRoute = {
    contact: ["full_name", "email_address", "message"],
    careers: ["full_name", "email_address", "contact_number"],
  };
  const requiredFields = requiredByRoute[route] || [];
  for (const field of requiredFields) {
    const value = String(source[field] || "").trim();
    if (!value) {
      return { accepted: false, code: "abuse_missing_required_fields" };
    }
  }

  const userAgent = String(request.headers.get("user-agent") || "").toLowerCase();
  if (/(python|curl|wget|httpclient|go-http-client|java\/|postmanruntime)/.test(userAgent)) {
    return { accepted: false, code: "abuse_automation_user_agent" };
  }

  return { accepted: true, code: "" };
}

function applyRateLimit(route, request, env) {
  const now = Date.now();
  const windowMs = readIntEnv(env.RATE_LIMIT_WINDOW_MS, 5 * 60 * 1000, 10000, 60 * 60 * 1000);
  const maxRequests = readIntEnv(env.RATE_LIMIT_MAX_REQUESTS, 8, 1, 200);
  const burstWindowMs = readIntEnv(env.RATE_LIMIT_BURST_WINDOW_MS, 15000, 2000, 120000);
  const burstMaxRequests = readIntEnv(env.RATE_LIMIT_BURST_MAX_REQUESTS, 3, 1, 50);
  const ip = getClientIp(request);
  const key = `${route}:${ip}`;

  for (const [candidateKey, state] of RATE_LIMIT_STATE) {
    if (now - state.lastSeen > windowMs) {
      RATE_LIMIT_STATE.delete(candidateKey);
    }
  }

  const state = RATE_LIMIT_STATE.get(key) || { timestamps: [], lastSeen: now };
  const windowCutoff = now - windowMs;
  const burstCutoff = now - burstWindowMs;
  state.timestamps = state.timestamps.filter((ts) => ts >= windowCutoff);

  const burstCount = state.timestamps.filter((ts) => ts >= burstCutoff).length;
  if (state.timestamps.length >= maxRequests || burstCount >= burstMaxRequests) {
    const oldestRelevant = state.timestamps[0] || now;
    const retryAfterMs = Math.max(windowMs - (now - oldestRelevant), 1000);
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    state.lastSeen = now;
    RATE_LIMIT_STATE.set(key, state);
    return { blocked: true, retryAfterSeconds };
  }

  state.timestamps.push(now);
  state.lastSeen = now;
  RATE_LIMIT_STATE.set(key, state);
  return { blocked: false, retryAfterSeconds: 0 };
}

function getClientIp(request) {
  const cfIp = String(request.headers.get("cf-connecting-ip") || "").trim();
  if (cfIp) return cfIp;
  const forwardedFor = String(request.headers.get("x-forwarded-for") || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)[0];
  if (forwardedFor) return forwardedFor;
  return "unknown-client";
}

function resolveDestinationConfig(route, env) {
  if (route === "contact") {
    if (!env.ASSET_C5T) {
      return { ok: false, error: "Missing secret ASSET_C5T." };
    }
    return { ok: true, channel: "gmail", asset: env.ASSET_C5T };
  }

  if (route === "careers") {
    if (!env.ASSET_C5S) {
      return { ok: false, error: "Missing secret ASSET_C5S." };
    }
    return { ok: true, channel: "gsheets", asset: env.ASSET_C5S };
  }

  return { ok: false, error: "Unsupported route." };
}

async function parseIncomingBody(request) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("application/json")) {
    return await request.json();
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    return Object.fromEntries(params.entries());
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const obj = {};
    for (const [key, value] of form.entries()) {
      obj[key] = typeof value === "string" ? value : "";
    }
    return obj;
  }

  throw new Error("Unsupported content type");
}

function shouldEnforceTurnstile(env) {
  const raw = String(env.TURNSTILE_ENFORCE || "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

function extractTurnstileToken(payload) {
  if (!payload || typeof payload !== "object") return "";
  return String(
    payload.turnstileToken ||
      payload["cf-turnstile-response"] ||
      payload.cf_turnstile_response ||
      ""
  ).trim();
}

function stripTurnstileFields(payload) {
  const clone = { ...(payload || {}) };
  delete clone.turnstileToken;
  delete clone["cf-turnstile-response"];
  delete clone.cf_turnstile_response;
  return clone;
}

function sanitizePayload(input) {
  const scan = {
    removedTags: 0,
    removedCodeLike: 0,
    normalizedFields: 0,
    rejectedFields: [],
  };

  const source =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const out = {};

  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      const arr = value
        .map((v) => sanitizeText(v, key, scan))
        .filter((v) => typeof v === "string" && v.length > 0);

      if (arr.length) out[key] = arr;
      continue;
    }

    const cleaned = sanitizeText(value, key, scan);
    if (typeof cleaned === "string" && cleaned.length > 0) {
      out[key] = cleaned;
    }
  }

  return {
    accepted: scan.rejectedFields.length === 0,
    data: out,
    scan,
  };
}

function sanitizeText(value, key, scan) {
  let text = String(value ?? "");
  const original = text;

  text = text.replace(/<[^>]*>/g, () => {
    scan.removedTags += 1;
    return " ";
  });

  text = text.replace(CODE_SIGNATURE_PATTERN, () => {
    scan.removedCodeLike += 1;
    return " ";
  });

  text = text.replace(/[^\p{L}\p{N}\s.,;:!?@#%&()\-_/+'"\n]/gu, " ");
  text = text.replace(/\s{2,}/g, " ").trim();

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

  const codeTokenHits = (
    before.match(/(function\s*\(|=>|<script|SELECT\s+|DROP\s+|\{\{|\}\}|<\?)/gi) || []
  ).length;
  if (codeTokenHits > 0) return true;

  return after.length === 0 && before.trim().length > 0;
}

function originAllowed(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowlist = (env.ALLOWED_ORIGINS || "https://www.gabo.services,https://gabo.services")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return allowlist.includes(origin);
}

function readIntEnv(raw, fallback, min, max) {
  const parsed = Number.parseInt(String(raw ?? "").trim(), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function json(payload, status, request, env, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...buildCorsHeaders(request, env),
      ...extraHeaders,
    },
  });
}

function buildCorsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowlist = (env.ALLOWED_ORIGINS || "https://www.gabo.services,https://gabo.services")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const allowedOrigin = allowlist.includes(origin) ? origin : allowlist[0] || "*";

  return {
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
    vary: "origin",
  };
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
