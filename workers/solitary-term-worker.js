export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = String(request.method || "GET").toUpperCase();
    const path = normalizePath(url.pathname);

    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...buildCorsHeaders(request, env),
          ...buildSecurityHeaders(),
        },
      });
    }

    if (method === "GET" && (path === ROUTES.root || path === ROUTES.health)) {
      return jsonResponse(
        {
          ok: true,
          worker: "solitary-term",
          routes: {
            health: [ROUTES.root, ROUTES.health],
            ingest: [ROUTES.root, ROUTES.ingest],
            contact_submit: [ROUTES.submitContact],
            careers_submit: [ROUTES.submitCareers],
          },
          accepts: ["application/json"],
          methods: ["GET", "POST", "OPTIONS"],
          allowed_origins: getAllowedOrigins(env),
        },
        200,
        request,
        env
      );
    }

    if (method !== "POST") {
      return jsonResponse(
        { ok: false, error: "Method not allowed." },
        405,
        request,
        env
      );
    }

    if (!isAcceptedPostPath(path)) {
      return jsonResponse(
        { ok: false, error: "Not found." },
        404,
        request,
        env
      );
    }

    const originCheck = originAllowedDetailed(request, env);
    if (!originCheck.ok) {
      return jsonResponse(
        {
          ok: false,
          error: "Origin not allowed.",
          detail: {
            candidates: originCheck.candidates,
            allowed: originCheck.allowed,
          },
        },
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

    const contentType = String(request.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("application/json")) {
      return jsonResponse(
        { ok: false, error: "Expected application/json." },
        415,
        request,
        env
      );
    }

    let incoming;
    try {
      incoming = await request.json();
    } catch {
      return jsonResponse(
        { ok: false, error: "Invalid JSON body." },
        400,
        request,
        env
      );
    }

    const routeResult = resolveSubmissionRoute(path, request, env);
    if (!routeResult.ok) {
      return jsonResponse(
        {
          ok: false,
          error: routeResult.error,
        },
        routeResult.status || 403,
        request,
        env
      );
    }

    const businessPayload = { ...incoming };
    const cleanedResult = cleanAndValidatePayload(routeResult.route.key, businessPayload);

    if (!cleanedResult.ok) {
      return jsonResponse(
        {
          ok: false,
          error: cleanedResult.error,
          rejected_fields: cleanedResult.rejectedFields,
        },
        422,
        request,
        env
      );
    }

    if (!env.DELIVERY || typeof env.DELIVERY.fetch !== "function") {
      return jsonResponse(
        { ok: false, error: "Missing internal delivery binding." },
        500,
        request,
        env
      );
    }

    if (!env.SOLITARY_TO_CORREO_SHARED_SECRET) {
      return jsonResponse(
        { ok: false, error: "Missing SOLITARY_TO_CORREO_SHARED_SECRET." },
        500,
        request,
        env
      );
    }

    const outboundPayload = {
      version: 2,
      source_worker: "solitary-term",
      route: routeResult.route.key,
      destination: routeResult.route.destination,
      asset_name: routeResult.route.assetName,
      request_id: crypto.randomUUID(),
      received_at: new Date().toISOString(),
      payload: cleanedResult.payload,
      screening: {
        risk_score: cleanedResult.riskScore,
        warnings: cleanedResult.warnings,
        sanitizer: "plain-text-only",
      },
    };

    let deliveryResponse;
    try {
      deliveryResponse = await env.DELIVERY.fetch(
        new Request(`https://internal.local${routeResult.route.internalPath}`, {
          method: "POST",
          headers: {
            "content-type": "application/json; charset=utf-8",
            "x-solitary-route": routeResult.route.key,
            "x-solitary-bridge-secret": env.SOLITARY_TO_CORREO_SHARED_SECRET,
          },
          body: JSON.stringify(outboundPayload),
        })
      );
    } catch (error) {
      return jsonResponse(
        {
          ok: false,
          error: "Internal delivery request failed.",
          detail: String(error && error.message ? error.message : error),
        },
        502,
        request,
        env
      );
    }

    if (!deliveryResponse.ok) {
      const detail = (await safeReadText(deliveryResponse)).slice(0, 4000);
      return jsonResponse(
        {
          ok: false,
          error: `Internal delivery failed (${deliveryResponse.status}).`,
          detail,
        },
        502,
        request,
        env
      );
    }

    const deliveryText = (await safeReadText(deliveryResponse)).slice(0, 4000);
    const deliveryJson = tryParseJson(deliveryText);

    return jsonResponse(
      {
        ok: true,
        accepted: true,
        route: routeResult.route.key,
        destination: routeResult.route.destination,
        request_id: outboundPayload.request_id,
        delivery_status: deliveryResponse.status,
        delivery_response: deliveryJson || deliveryText || "OK",
      },
      200,
      request,
      env
    );
  },
};

const ROUTES = {
  root: "/",
  health: "/health",
  ingest: "/ingest",
  submitContact: "/submit/contact",
  submitCareers: "/submit/careers",
};

const API_CSP =
  "default-src 'none'; " +
  "base-uri 'none'; " +
  "object-src 'none'; " +
  "frame-ancestors 'none'; " +
  "form-action 'none'; " +
  "script-src 'none'; " +
  "script-src-elem 'none'; " +
  "style-src 'none'; " +
  "img-src 'none'; " +
  "connect-src 'none'; " +
  "font-src 'none'; " +
  "media-src 'none'; " +
  "manifest-src 'none'; " +
  "worker-src 'none'; " +
  "upgrade-insecure-requests; " +
  "block-all-mixed-content";

const API_PERMISSIONS_POLICY =
  "geolocation=(), camera=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), microphone=(), browsing-topics=(), interest-cohort=()";

function buildSecurityHeaders() {
  return {
    "Content-Security-Policy": API_CSP,
    "Content-Security-Policy-Report-Only": API_CSP,
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy": API_PERMISSIONS_POLICY,
    "X-XSS-Protection": "0",
    "X-Permitted-Cross-Domain-Policies": "none",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Cache-Control": "no-store",
  };
}

function isAcceptedPostPath(path) {
  return (
    path === ROUTES.root ||
    path === ROUTES.ingest ||
    path === ROUTES.submitContact ||
    path === ROUTES.submitCareers
  );
}

function resolveSubmissionRoute(path, request, env) {
  if (path === ROUTES.submitContact) {
    return {
      ok: true,
      route: {
        key: "contact",
        destination: "gmail",
        assetName: "PATH_CONTACT",
        internalPath: "/contact",
      },
    };
  }

  if (path === ROUTES.submitCareers) {
    return {
      ok: true,
      route: {
        key: "careers",
        destination: "gsheets",
        assetName: "PATH_CAREERS",
        internalPath: "/careers",
      },
    };
  }

  const assetId = String(request.headers.get("x-ops-asset-id") || "").trim();
  const assetRoute = resolveRouteByAsset(assetId, env);

  if (!assetRoute) {
    return {
      ok: false,
      status: 403,
      error: "Unknown asset identity.",
    };
  }

  return {
    ok: true,
    route: assetRoute,
  };
}

function resolveRouteByAsset(assetId, env) {
  if (safeEqual(assetId, String(env.ASSET_C5T || ""))) {
    return {
      key: "contact",
      destination: "gmail",
      assetName: "ASSET_C5T",
      internalPath: "/contact",
    };
  }

  if (safeEqual(assetId, String(env.ASSET_C5S || ""))) {
    return {
      key: "careers",
      destination: "gsheets",
      assetName: "ASSET_C5S",
      internalPath: "/careers",
    };
  }

  return null;
}

function cleanAndValidatePayload(routeKey, input) {
  const isObject = input && typeof input === "object" && !Array.isArray(input);
  if (!isObject) {
    return {
      ok: false,
      error: "Body must be an object with text fields.",
      rejectedFields: [],
    };
  }

  const fieldSpecs = {
    contact: {
      required: ["full_name", "email_address", "message"],
      textFields: [
        "full_name",
        "email_address",
        "space_suite_apt",
        "country_code",
        "contact_number",
        "contact_interest",
        "best_time_to_contact",
        "city",
        "state_province",
        "country_zip_code",
        "message",
        "remote_interest",
        "experience_level",
        "education",
      ],
      listFields: ["remote_assistant_skills", "languages"],
      urlFields: [],
      aliases: {
        name: "full_name",
        email: "email_address",
        phone: "contact_number",
      },
    },
    careers: {
      required: ["full_name", "email_address"],
      textFields: [
        "full_name",
        "email_address",
        "country_code",
        "contact_number",
        "city",
        "state_province",
        "country_zip_code",
        "availability",
      ],
      listFields: [
        "career_interest",
        "experience_items",
        "languages",
        "skills",
        "projects",
        "education_items",
      ],
      urlFields: ["resume_or_profile_link"],
      aliases: {
        name: "full_name",
        email: "email_address",
        phone: "contact_number",
        "career_interest[]": "career_interest",
      },
    },
  };

  const spec = fieldSpecs[routeKey];
  if (!spec) {
    return {
      ok: false,
      error: "Unknown route specification.",
      rejectedFields: [],
    };
  }

  const normalizedInput = applyAliases(input, spec.aliases, spec.listFields);
  const cleaned = {};
  const warnings = [];
  const rejectedFields = [];
  let riskScore = 0;

  for (const field of spec.textFields) {
    const raw = coerceToString(normalizedInput[field]);
    if (!raw) continue;

    const result = sanitizePlainText(raw, field);
    riskScore += result.score;

    if (result.notes.length) warnings.push({ field, notes: result.notes });

    if (result.blocked) {
      rejectedFields.push(field);
      continue;
    }

    if (!result.value) continue;
    cleaned[field] = result.value;
  }

  for (const field of spec.listFields) {
    const listResult = sanitizeTextList(normalizedInput[field], field);
    riskScore += listResult.score;

    if (listResult.notes.length) warnings.push({ field, notes: listResult.notes });

    if (listResult.blocked) {
      rejectedFields.push(field);
      continue;
    }

    if (listResult.value.length) cleaned[field] = listResult.value;
  }

  for (const field of spec.urlFields) {
    const raw = coerceToString(normalizedInput[field]);
    if (!raw) continue;

    const textResult = sanitizePlainText(raw, field);
    riskScore += textResult.score;

    if (textResult.notes.length) warnings.push({ field, notes: textResult.notes });

    if (textResult.blocked || !textResult.value) {
      rejectedFields.push(field);
      continue;
    }

    const normalized = normalizeUrl(textResult.value);
    if (!normalized) {
      rejectedFields.push(field);
      continue;
    }

    cleaned[field] = normalized;
  }

  if (cleaned.email_address) {
    const normalizedEmail = normalizeEmail(cleaned.email_address);
    if (!normalizedEmail) rejectedFields.push("email_address");
    else cleaned.email_address = normalizedEmail;
  }

  if (cleaned.contact_number) {
    cleaned.contact_number = normalizePhone(cleaned.contact_number);
  }

  if (cleaned.country_code) {
    cleaned.country_code = normalizeCountryCode(cleaned.country_code);
  }

  for (const field of spec.required) {
    const value = cleaned[field];
    if (Array.isArray(value)) {
      if (!value.length) rejectedFields.push(field);
    } else if (!value) {
      rejectedFields.push(field);
    }
  }

  const uniqueRejected = [...new Set(rejectedFields)];

  if (uniqueRejected.length) {
    return {
      ok: false,
      error: "Plain-text validation failed.",
      rejectedFields: uniqueRejected,
    };
  }

  if (!Object.keys(cleaned).length) {
    return {
      ok: false,
      error: "No acceptable plain-text content found.",
      rejectedFields: [],
    };
  }

  if (riskScore >= 8) {
    return {
      ok: false,
      error: "Input was too suspicious after sanitation.",
      rejectedFields: [],
    };
  }

  return {
    ok: true,
    payload: cleaned,
    warnings,
    riskScore,
  };
}

function applyAliases(input, aliases, listFields) {
  const out = {};

  for (const [rawKey, rawValue] of Object.entries(input || {})) {
    let key = String(rawKey || "").trim();
    if (!key) continue;

    if (Object.prototype.hasOwnProperty.call(aliases, key)) {
      key = aliases[key];
    } else if (key.endsWith("[]")) {
      const base = key.slice(0, -2);
      if (listFields.includes(base)) key = base;
    }

    if (Array.isArray(rawValue)) {
      const existing = Array.isArray(out[key]) ? out[key] : [];
      out[key] = existing.concat(rawValue);
    } else if (!(key in out)) {
      out[key] = rawValue;
    } else if (Array.isArray(out[key])) {
      out[key].push(rawValue);
    } else {
      out[key] = [out[key], rawValue];
    }
  }

  return out;
}

function sanitizeTextList(value, fieldName) {
  const notes = [];
  let score = 0;
  const items = [];

  const pushSanitized = (raw) => {
    const text = coerceToString(raw);
    if (!text) return;

    const result = sanitizePlainText(text, fieldName);
    score += result.score;

    if (result.notes.length) notes.push(...result.notes);
    if (!result.blocked && result.value) items.push(result.value);
  };

  if (Array.isArray(value)) {
    for (const entry of value.slice(0, 50)) pushSanitized(entry);
  } else if (typeof value === "string") {
    const raw = value.trim();
    if (raw) {
      let parts = [raw];

      if (
        fieldName === "career_interest" ||
        fieldName === "remote_assistant_skills" ||
        fieldName === "languages" ||
        fieldName === "skills"
      ) {
        parts = raw.split(/[\n,;]+/g);
      } else if (
        fieldName === "experience_items" ||
        fieldName === "projects" ||
        fieldName === "education_items"
      ) {
        parts = raw.includes("\n") ? raw.split(/\n+/g) : [raw];
      }

      for (const part of parts.slice(0, 50)) pushSanitized(part);
    }
  } else if (value != null) {
    pushSanitized(value);
  }

  const deduped = [...new Set(items.map((x) => x.trim()).filter(Boolean))].slice(0, 50);

  return {
    value: deduped,
    blocked: false,
    score,
    notes: [...new Set(notes)],
  };
}

function sanitizePlainText(value, fieldName) {
  let text = String(value || "").normalize("NFKC");
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

  let cleaned = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/[{}[\]^|\\;]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const codeMarkers = [
    /=>/,
    /\bfunction\s*\(/i,
    /\bconst\s+\w+/i,
    /\blet\s+\w+/i,
    /\bvar\s+\w+/i,
    /\bimport\s+/i,
    /\bexport\s+/i,
    /<\w+/,
    /<\/\w+>/,
  ];

  let markerCount = 0;
  for (const marker of codeMarkers) {
    if (marker.test(original)) markerCount += 1;
  }

  if (markerCount >= 2) {
    score += 3;
    notes.push("code-like syntax detected");
  }

  if (cleaned !== text) {
    notes.push("non-plain-text removed");
  }

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
    full_name: 160,
    email_address: 254,
    space_suite_apt: 120,
    country_code: 12,
    contact_number: 40,
    contact_interest: 160,
    best_time_to_contact: 120,
    city: 120,
    state_province: 120,
    country_zip_code: 80,
    message: 5000,
    remote_interest: 160,
    experience_level: 160,
    education: 300,
    availability: 160,
    resume_or_profile_link: 300,
    career_interest: 160,
    experience_items: 400,
    languages: 120,
    skills: 200,
    projects: 400,
    education_items: 300,
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

function normalizePhone(value) {
  return String(value || "")
    .replace(/[^\d+()\-\s]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 40);
}

function normalizeCountryCode(value) {
  const cleaned = String(value || "")
    .replace(/[^\d+]/g, "")
    .trim();
  return cleaned.slice(0, 12);
}

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return /^https?:\/\//i.test(text) ? text.slice(0, 300) : "";
}

function coerceToString(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function normalizePath(pathname) {
  const raw = String(pathname || "").trim();
  const withSlash = raw ? (raw.startsWith("/") ? raw : `/${raw}`) : "/";
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
}

function normalizeOrigin(value) {
  const raw = String(value || "").trim();
  if (!raw || raw.toLowerCase() === "null") return "";
  try {
    return new URL(raw).origin.toLowerCase();
  } catch {
    return raw.replace(/\/$/, "").toLowerCase();
  }
}

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((x) => normalizeOrigin(x))
    .filter(Boolean);
}

function getAllowedOrigins(env) {
  const allowed = parseCsv(
    env.ALLOWED_ORIGINS || "https://www.gabo.services,https://gabo.services"
  );

  return allowed.length
    ? [...new Set(allowed)]
    : ["https://www.gabo.services", "https://gabo.services"];
}

function getCandidateOrigins(request) {
  const candidates = [];

  const origin = normalizeOrigin(request.headers.get("origin") || "");
  if (origin) candidates.push(origin);

  const parentOrigin = normalizeOrigin(request.headers.get("x-gabo-parent-origin") || "");
  if (parentOrigin) candidates.push(parentOrigin);

  const referer = request.headers.get("referer") || request.headers.get("referrer") || "";
  const refererOrigin = normalizeOrigin(referer);
  if (refererOrigin) candidates.push(refererOrigin);

  return [...new Set(candidates)];
}

function originAllowedDetailed(request, env) {
  const allowed = getAllowedOrigins(env);
  const candidates = getCandidateOrigins(request);

  if (!candidates.length) {
    return {
      ok: true,
      matched: "",
      candidates: [],
      allowed,
    };
  }

  for (const candidate of candidates) {
    if (allowed.includes(candidate)) {
      return {
        ok: true,
        matched: candidate,
        candidates,
        allowed,
      };
    }
  }

  return {
    ok: false,
    matched: "",
    candidates,
    allowed,
  };
}

function buildCorsHeaders(request, env) {
  const allowed = getAllowedOrigins(env);
  const originCheck = originAllowedDetailed(request, env);
  const requestedHeaders = String(
    request.headers.get("access-control-request-headers") || ""
  ).trim();

  const allowOrigin =
    originCheck.matched ||
    allowed[0] ||
    "https://www.gabo.services";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      requestedHeaders || "content-type, x-ops-asset-id, x-gabo-parent-origin",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin, Access-Control-Request-Headers",
    "Cache-Control": "no-store",
  };
}

function jsonResponse(data, status, request, env) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...buildCorsHeaders(request, env),
      ...buildSecurityHeaders(),
    },
  });
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
