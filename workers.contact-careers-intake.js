const DEFAULT_UPSTREAM_URL = "https://solitary-term-4203.rulathemtodos.workers.dev/ingest";

const CODE_SIGNATURE_PATTERN =
  /(javascript:|data:text\/html|vbscript:|<script|<iframe|<object|<embed|onerror\s*=|onload\s*=|onclick\s*=|function\s*\(|=>|\beval\b|document\.cookie|localStorage|sessionStorage|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bCREATE\b|\bALTER\b|\{\{|\}\}|<\?|\?>)/gi;
const HONEYPOT_FIELDS = ["company_website", "portfolio_url"];
const URL_PATTERN = /https?:\/\/|www\./gi;
const REPEATED_CHAR_PATTERN = /(.)\1{19,}/;
const clientRateState = new Map();

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

    const rateLimit = enforceRateLimit(request, env);
    if (!rateLimit.allowed) {
      return json(
        {
          ok: false,
          error: "Too many submissions. Please wait and try again.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        429,
        request,
        env,
        { "Retry-After": String(rateLimit.retryAfterSeconds) }
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

    const abuseSignal = detectAbuse(payload, env);
    if (abuseSignal.blocked) {
      return json(
        { ok: false, error: abuseSignal.error, code: abuseSignal.code },
        abuseSignal.status,
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

function enforceRateLimit(request, env) {
  const maxRequests = parsePositiveInt(env.RATE_LIMIT_MAX, 8);
  const windowSeconds = parsePositiveInt(env.RATE_LIMIT_WINDOW_SECONDS, 60);
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const key = buildClientRateKey(request);
  const state = clientRateState.get(key) || { count: 0, resetAt: now + windowMs };
  if (now >= state.resetAt) {
    state.count = 0;
    state.resetAt = now + windowMs;
  }

  state.count += 1;
  clientRateState.set(key, state);

  if (clientRateState.size > 5000) {
    pruneExpiredRateKeys(now);
  }

  return {
    allowed: state.count <= maxRequests,
    retryAfterSeconds: Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
  };
}

function buildClientRateKey(request) {
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("x-forwarded-for") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "ua:missing";
  return `${ip}|${userAgent.slice(0, 120)}`;
}

function pruneExpiredRateKeys(now) {
  for (const [key, state] of clientRateState.entries()) {
    if (!state || now >= state.resetAt) {
      clientRateState.delete(key);
    }
  }
}

function parsePositiveInt(raw, fallback) {
  const num = Number.parseInt(String(raw || ""), 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

function detectAbuse(payload, env) {
  if (!payload || typeof payload !== "object") return { blocked: false };

  const values = Object.values(payload).map((value) => String(value ?? ""));
  const content = values.join(" ").trim();

  const maxChars = parsePositiveInt(env.MAX_SUBMISSION_CHARS, 10000);
  if (content.length > maxChars) {
    return {
      blocked: true,
      status: 413,
      code: "payload_too_large",
      error: "Submission exceeds allowed size.",
    };
  }

  const urlHits = (content.match(URL_PATTERN) || []).length;
  const maxUrls = parsePositiveInt(env.MAX_URLS_PER_SUBMISSION, 3);
  if (urlHits > maxUrls) {
    return {
      blocked: true,
      status: 422,
      code: "too_many_links",
      error: "Submission contains too many links.",
    };
  }

  if (REPEATED_CHAR_PATTERN.test(content)) {
    return {
      blocked: true,
      status: 422,
      code: "repetitive_content",
      error: "Submission contains repetitive content and was blocked.",
    };
  }

  return { blocked: false };
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
