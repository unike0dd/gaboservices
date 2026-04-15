const DEFAULT_UPSTREAM_URL = "https://solitary-term-4203.rulathemtodos.workers.dev/ingest";

const CODE_SIGNATURE_PATTERN =
  /(javascript:|data:text\/html|vbscript:|<script|<iframe|<object|<embed|onerror\s*=|onload\s*=|onclick\s*=|function\s*\(|=>|\beval\b|document\.cookie|localStorage|sessionStorage|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bCREATE\b|\bALTER\b|\{\{|\}\}|<\?|\?>)/gi;
const HONEYPOT_FIELDS = ["company_website", "portfolio_url"];
const SUSPICIOUS_USER_AGENT_PATTERN =
  /(curl|wget|python-requests|python-httpx|aiohttp|scrapy|headless|httpclient|okhttp|go-http-client|postmanruntime|insomnia|sqlmap|nikto|nmap)/i;

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

    if (isSuspiciousUserAgent(request, env)) {
      return json({ ok: false, error: "Submission blocked." }, 403, request, env);
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

    const anomaly = detectPayloadAnomaly(payload, env);
    if (anomaly) {
      return json(
        { ok: false, error: "Payload rejected.", code: anomaly.code },
        anomaly.status,
        request,
        env
      );
    }

    const rateLimit = await enforceRateLimit(request, route, env);
    if (!rateLimit.ok) {
      return json(
        {
          ok: false,
          error: "Too many requests. Please retry shortly.",
          code: "rate_limited",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        429,
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

function isSuspiciousUserAgent(request, env) {
  const userAgent = String(request.headers.get("user-agent") || "").trim();
  if (!userAgent) return false;
  if (shouldAllowProgrammaticUserAgents(env)) return false;
  return SUSPICIOUS_USER_AGENT_PATTERN.test(userAgent);
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

function shouldAllowProgrammaticUserAgents(env) {
  const raw = String(env.ALLOW_PROGRAMMATIC_USER_AGENTS || "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

function detectPayloadAnomaly(payload, env) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

  const maxFields = readPositiveInt(env.MAX_FORM_FIELDS, 80);
  const maxFieldLength = readPositiveInt(env.MAX_FORM_FIELD_LENGTH, 4000);
  const maxPayloadChars = readPositiveInt(env.MAX_FORM_PAYLOAD_CHARS, 20000);

  const entries = Object.entries(payload);
  if (entries.length > maxFields) {
    return { code: "too_many_fields", status: 422 };
  }

  let totalChars = 0;
  for (const [, value] of entries) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      const text = String(item ?? "");
      totalChars += text.length;
      if (text.length > maxFieldLength) {
        return { code: "field_too_large", status: 413 };
      }
      if (totalChars > maxPayloadChars) {
        return { code: "payload_too_large", status: 413 };
      }
    }
  }

  return null;
}

async function enforceRateLimit(request, route, env) {
  if (!isRateLimitEnabled(env)) {
    return { ok: true };
  }

  const limit = readPositiveInt(env.RATE_LIMIT_MAX_REQUESTS, 10);
  const windowSeconds = readPositiveInt(env.RATE_LIMIT_WINDOW_SECONDS, 60);
  const nowBucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const fingerprint = getClientFingerprint(request, route);
  const key = `https://rate-limit.gabo.internal/${route}/${nowBucket}/${fingerprint}`;
  const cacheKey = new Request(key, { method: "GET" });

  const cached = await caches.default.match(cacheKey);
  const currentCount = cached ? Number(await cached.text()) || 0 : 0;
  const nextCount = currentCount + 1;
  const retryAfterSeconds = windowSeconds - (Math.floor(Date.now() / 1000) % windowSeconds);

  const response = new Response(String(nextCount), {
    headers: { "cache-control": `max-age=${windowSeconds}` },
  });
  await caches.default.put(cacheKey, response);

  if (nextCount > limit) {
    return { ok: false, retryAfterSeconds };
  }

  return { ok: true };
}

function isRateLimitEnabled(env) {
  const raw = String(env.RATE_LIMIT_ENABLED || "true").trim().toLowerCase();
  return !(raw === "0" || raw === "false" || raw === "no" || raw === "off");
}

function getClientFingerprint(request, route) {
  const ip =
    String(
      request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for") ||
        "unknown-ip"
    ).split(",")[0].trim();
  const ua = String(request.headers.get("user-agent") || "unknown-ua").slice(0, 120);
  return encodeURIComponent(`${route}:${ip}:${ua}`);
}

function readPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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

function collectTextValues(payload) {
  if (!payload || typeof payload !== "object") return [];
  const values = [];
  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) {
      for (const item of value) values.push(String(item ?? ""));
      continue;
    }
    values.push(String(value ?? ""));
  }
  return values;
}

function detectAbuseSignals(payload, route) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, status: 400, code: "invalid_payload", error: "Invalid payload." };
  }

  const requiredByRoute = {
    contact: ["full_name", "email_address", "contact_number", "message"],
    careers: ["full_name", "email_address", "contact_number", "city", "state_province"],
  };
  const requiredFields = requiredByRoute[route] || [];
  const missing = requiredFields.filter(
    (field) => String(payload[field] ?? "").trim().length === 0
  );
  if (missing.length > 0) {
    return {
      ok: false,
      status: 422,
      code: "missing_required_fields",
      error: `Missing required fields: ${missing.join(", ")}.`,
    };
  }

  const texts = collectTextValues(payload);
  const combinedLength = texts.reduce((sum, value) => sum + value.length, 0);
  if (combinedLength > MAX_COMBINED_TEXT_LENGTH) {
    return {
      ok: false,
      status: 413,
      code: "payload_too_large",
      error: "Submission is too large.",
    };
  }

  const combined = texts.join(" ").toLowerCase();
  const urlMatches = combined.match(/https?:\/\/|www\./g) || [];
  if (urlMatches.length > MAX_URL_PATTERN_COUNT) {
    return {
      ok: false,
      status: 422,
      code: "abuse_url_density",
      error: "Submission blocked by abuse detection.",
    };
  }

  if (/(.)\1{30,}/.test(combined)) {
    return {
      ok: false,
      status: 422,
      code: "abuse_repeated_sequence",
      error: "Submission blocked by abuse detection.",
    };
  }

  return { ok: true };
}

function readClientFingerprint(request) {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown";
  const ua = request.headers.get("user-agent") || "unknown";
  return `${ip}|${ua.slice(0, 120)}`;
}

async function enforceRateLimit(request, env, route) {
  if (toBooleanFlag(env.RATE_LIMIT_DISABLED)) return { ok: true };

  const windowSeconds = readPositiveInt(
    env.RATE_LIMIT_WINDOW_SECONDS,
    DEFAULT_RATE_LIMIT_WINDOW_SECONDS
  );
  const maxRequests = readPositiveInt(
    env.RATE_LIMIT_MAX_REQUESTS,
    DEFAULT_RATE_LIMIT_MAX_REQUESTS
  );
  const nowSeconds = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(nowSeconds / windowSeconds);
  const fingerprint = readClientFingerprint(request);
  const cacheKey = new Request(
    `https://rate-limit.gabo.internal/${route}/${bucket}/${encodeURIComponent(
      fingerprint
    )}`
  );
  const cache = caches.default;

  let count = 0;
  try {
    const existing = await cache.match(cacheKey);
    if (existing) {
      const parsed = await existing.json();
      count = Number.parseInt(String(parsed && parsed.count), 10) || 0;
    }

    count += 1;
    const ttl = Math.max(1, windowSeconds - (nowSeconds % windowSeconds));
    const response = new Response(JSON.stringify({ count }), {
      headers: {
        "content-type": "application/json",
        "cache-control": `max-age=${ttl}`,
      },
    });
    await cache.put(cacheKey, response);

    if (count > maxRequests) {
      return { ok: false, retryAfterSeconds: ttl };
    }
  } catch {
    return { ok: true };
  }

  return { ok: true };
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
