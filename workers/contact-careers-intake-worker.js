/**
 * Repo-facing intake Worker
 *
 * Public intake routes:
 * - POST /api/intake/contact   (legacy: /submit/contact)
 * - POST /api/intake/careers   (legacy: /submit/careers)
 *
 * Route -> asset mapping:
 * - contact -> ASSET_C5T
 * - careers -> ASSET_C5S
 *
 * This Worker:
 * 1) accepts browser form submissions
 * 2) performs light local cleanup
 * 3) forwards the plain-text payload to solitary-term
 *
 * solitary-term then:
 * 4) authenticates repo worker
 * 5) performs stricter sanitation / scanning
 * 6) routes onward to hidden bridge Worker
 */

const DEFAULT_UPSTREAM_URL = "https://solitary-term-4203.rulathemtodos.workers.dev/ingest";

const CODE_SIGNATURE_PATTERN =
  /(javascript:|data:text\/html|vbscript:|<script|<iframe|<object|<embed|onerror\s*=|onload\s*=|onclick\s*=|function\s*\(|=>|\beval\b|document\.cookie|localStorage|sessionStorage|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bCREATE\b|\bALTER\b|\{\{|\}\}|<\?|\?>)/gi;

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

    if (!originAllowed(request, env)) {
      return jsonResponse(
        { ok: false, error: "Origin not allowed." },
        403,
        request,
        env
      );
    }

    const contentLength = Number(request.headers.get("content-length") || "0");
    const maxBodyBytes = Number(env.MAX_BODY_BYTES || 32768);

    if (contentLength && contentLength > maxBodyBytes) {
      return jsonResponse(
        { ok: false, error: "Payload too large." },
        413,
        request,
        env
      );
    }

    const assetId = (
      request.headers.get("x-ops-asset-id") ||
      request.headers.get("x-intake-asset") ||
      ""
    ).trim();

    const route = resolveRouteByAsset(assetId, env);

    if (!route) {
      return jsonResponse(
        { ok: false, error: "Unknown asset identity." },
        403,
        request,
        env
      );
    }

    let incoming;

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

    const sanitized = sanitizePayload(payload);
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
    const repoSharedSecret = String(env.REPO_SHARED_SECRET || "").trim();

    if (!repoSharedSecret) {
      return json(
        { ok: false, error: "Missing secret REPO_SHARED_SECRET." },
        500,
        request,
        env
      );
    }

    const relayResponse = await fetch(upstream, {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-repo-shared-secret": repoSharedSecret,
        "x-ops-asset-id": config.asset,
        "x-intake-source": route,
      },
      body: JSON.stringify(sanitized.data),
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

function sanitizePayload(input) {
  const scan = {
    removedTags: 0,
    removedCodeLike: 0,
    normalizedFields: 0,
    rejectedFields: [],
  };

  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
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
  const notes = [];
  let score = 0;

  text = text
    .replace(/\u0000/g, " ")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\r\n?/g, "\n")
    .trim();

  const hardSignals = [
    { regex: /<script[\s\S]*?>/i, weight: 5, note: "script tag detected" },
    { regex: /<\/script>/i, weight: 5, note: "script close tag detected" },
    { regex: /javascript:/i, weight: 4, note: "javascript protocol detected" },
    { regex: /vbscript:/i, weight: 4, note: "vbscript protocol detected" },
    { regex: /data:text\/html/i, weight: 4, note: "html data url detected" },
    { regex: /onerror\s*=/i, weight: 4, note: "event handler detected" },
    { regex: /onload\s*=/i, weight: 4, note: "event handler detected" },
    { regex: /onclick\s*=/i, weight: 4, note: "event handler detected" },
    { regex: /document\.cookie/i, weight: 4, note: "cookie access detected" },
    { regex: /localstorage|sessionstorage/i, weight: 3, note: "browser storage access detected" },
    { regex: /\beval\s*\(/i, weight: 5, note: "eval detected" },
    { regex: /\bnew\s+function\s*\(/i, weight: 5, note: "dynamic function detected" },
    { regex: /\bfetch\s*\(/i, weight: 3, note: "fetch call detected" },
    { regex: /\bxmlhttprequest\b/i, weight: 3, note: "xhr detected" },
    { regex: /<\?php/i, weight: 5, note: "php code detected" },
    { regex: /\bunion\s+select\b/i, weight: 5, note: "sql injection pattern detected" },
    { regex: /\bdrop\s+table\b/i, weight: 5, note: "sql destructive pattern detected" },
    { regex: /\binsert\s+into\b/i, weight: 4, note: "sql insertion pattern detected" },
    { regex: /\bdelete\s+from\b/i, weight: 4, note: "sql deletion pattern detected" },
    { regex: /\bupdate\s+\w+\s+set\b/i, weight: 4, note: "sql update pattern detected" },
    { regex: /\bcurl\s+https?:\/\//i, weight: 3, note: "command pattern detected" },
    { regex: /\bwget\s+https?:\/\//i, weight: 3, note: "command pattern detected" },
    { regex: /\bpowershell\b/i, weight: 3, note: "powershell pattern detected" },
    { regex: /%3cscript/i, weight: 5, note: "encoded script pattern detected" },
  ];

  for (const signal of hardSignals) {
    if (signal.regex.test(text)) {
      score += signal.weight;
      notes.push(signal.note);
    }
  }

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

  const removalRatio = 1 - cleaned.length / Math.max(text.length, 1);
  if (removalRatio > 0.35) {
    score += 2;
    notes.push("high removal ratio");
  }

  cleaned = cleaned
    .replace(/[<>]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!cleaned) {
    return {
      value: "",
      blocked: true,
      score,
      notes: [...notes, "empty after sanitation"],
    };
  }

  const maxFieldLengths = {
    name: 120,
    email: 254,
    phone: 40,
    company: 160,
    subject: 180,
    city: 120,
    role: 160,
    experience: 300,
    linkedin: 300,
    portfolio: 300,
    message: 5000,
  };

  const maxLength = maxFieldLengths[fieldName] || 500;
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength).trim();
    notes.push("trimmed to max length");
  }

  return {
    value: cleaned,
    blocked: score >= 5,
    score,
    notes,
  };
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

  const codeTokenHits = (
    before.match(/(function\s*\(|=>|<script|SELECT\s+|DROP\s+|\{\{|\}\}|<\?)/gi) || []
  ).length;
  if (codeTokenHits > 0) return true;

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return /^https?:\/\//i.test(text) ? text.slice(0, 300) : "";
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

function json(payload, status, request, env) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...buildCorsHeaders(request, env),
    },
  });
}

function buildCorsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowlist = (env.ALLOWED_ORIGINS || "https://www.gabo.services,https://gabo.services")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

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
