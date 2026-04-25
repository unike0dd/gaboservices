export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = String(request.method || "GET").toUpperCase();
    const path = normalizePath(url.pathname);
    const requestId = crypto.randomUUID();

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
          stage: "health",
          worker: "solitary-term-4203",
          binding_required: "DELIVERY",
          routes: {
            health: [ROUTES.root, ROUTES.health],
            submit_contact: ROUTES.submitContact,
            submit_careers: ROUTES.submitCareers,
          },
          methods: ["GET", "POST", "OPTIONS"],
          accepts: ["application/json"],
          allowed_origins: getAllowedOrigins(env),
          config: {
            has_delivery_binding: !!(env.DELIVERY && typeof env.DELIVERY.fetch === "function"),
            has_shared_secret: !!env.SOLITARY_TO_CORREO_SHARED_SECRET,
            has_max_body_bytes: !!env.MAX_BODY_BYTES,
            has_asset_page: Boolean(String(env.ASSET_PAGE || "").trim()),
            has_asset_found: Boolean(String(env.ASSET_FOUND || "").trim()),
            has_private_asset_c5t: Boolean(String(env.ASSET_C5T || "").trim()),
            has_private_asset_c5s: Boolean(String(env.ASSET_C5S || "").trim()),
          },
        },
        200,
        request,
        env,
        requestId
      );
    }

    if (method === "GET" && path === ROUTES.debugConfig) {
      return jsonResponse(
        {
          ok: true,
          stage: "debug_config",
          worker: "solitary-term-4203",
          safe_config_only: true,
          has_delivery_binding: !!(env.DELIVERY && typeof env.DELIVERY.fetch === "function"),
          has_shared_secret: !!env.SOLITARY_TO_CORREO_SHARED_SECRET,
          has_asset_page: Boolean(String(env.ASSET_PAGE || "").trim()),
          has_asset_found: Boolean(String(env.ASSET_FOUND || "").trim()),
          has_private_asset_c5t: Boolean(String(env.ASSET_C5T || "").trim()),
          has_private_asset_c5s: Boolean(String(env.ASSET_C5S || "").trim()),
          allowed_origins_count: getAllowedOrigins(env).length,
          max_body_bytes: Number(env.MAX_BODY_BYTES || 32768),
          routes_present: {
            contact: true,
            careers: true,
          },
        },
        200,
        request,
        env,
        requestId
      );
    }

    if (method !== "POST") {
      return jsonResponse(
        { ok: false, stage: "method", error: "Method not allowed." },
        405,
        request,
        env,
        requestId
      );
    }

    if (!isAcceptedPostPath(path)) {
      return jsonResponse(
        { ok: false, stage: "route", error: "Not found.", path },
        404,
        request,
        env,
        requestId
      );
    }

    const originCheck = originAllowedDetailed(request, env);
    if (!originCheck.ok) {
      return jsonResponse(
        {
          ok: false,
          stage: "origin",
          error: "Origin not allowed.",
          detail: {
            candidates: originCheck.candidates,
            allowed: originCheck.allowed,
          },
        },
        403,
        request,
        env,
        requestId
      );
    }

    const assetCheck = validateOpsAssetId(request, env);
    if (!assetCheck.ok) {
      return jsonResponse(
        {
          ok: false,
          stage: "asset_identity",
          error: assetCheck.error,
        },
        assetCheck.status,
        request,
        env,
        requestId
      );
    }

    const contentLength = Number(request.headers.get("content-length") || "0");
    const maxBodyBytes = Number(env.MAX_BODY_BYTES || 32768);

    if (contentLength && contentLength > maxBodyBytes) {
      return jsonResponse(
        { ok: false, stage: "body_size", error: "Payload too large." },
        413,
        request,
        env,
        requestId
      );
    }

    const contentType = String(request.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("application/json")) {
      return jsonResponse(
        { ok: false, stage: "content_type", error: "Expected application/json." },
        415,
        request,
        env,
        requestId
      );
    }

    let incoming;
    try {
      incoming = await request.json();
    } catch {
      return jsonResponse(
        { ok: false, stage: "json_parse", error: "Invalid JSON body." },
        400,
        request,
        env,
        requestId
      );
    }

    const routeResult = resolveSubmissionRoute(path);
    if (!routeResult.ok) {
      return jsonResponse(
        {
          ok: false,
          stage: "route_resolve",
          error: routeResult.error,
        },
        routeResult.status || 403,
        request,
        env,
        requestId
      );
    }

    const businessPayload = { ...incoming };

    delete businessPayload.turnstileToken;
    delete businessPayload["cf-turnstile-response"];
    delete businessPayload.cf_turnstile_response;

    const cleanedResult = cleanAndValidatePayload(routeResult.route.key, businessPayload);
    if (!cleanedResult.ok) {
      return jsonResponse(
        {
          ok: false,
          stage: "payload_validation",
          error: cleanedResult.error,
          rejected_fields: cleanedResult.rejectedFields || [],
        },
        422,
        request,
        env,
        requestId
      );
    }

    if (!env.DELIVERY || typeof env.DELIVERY.fetch !== "function") {
      return jsonResponse(
        {
          ok: false,
          stage: "binding",
          error: "Missing internal DELIVERY Service Binding.",
        },
        500,
        request,
        env,
        requestId
      );
    }

    if (!env.SOLITARY_TO_CORREO_SHARED_SECRET) {
      return jsonResponse(
        {
          ok: false,
          stage: "binding_secret",
          error: "Missing SOLITARY_TO_CORREO_SHARED_SECRET.",
        },
        500,
        request,
        env,
        requestId
      );
    }

    const outboundPayload = {
      version: 2,
      source_worker: "solitary-term",
      route: routeResult.route.key,
      destination: routeResult.route.destination,
      asset_name: routeResult.route.assetName,
      request_id: requestId,
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
            "x-gabo-hop": "solitary-term",
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
          stage: "delivery_binding_fetch",
          error: "Internal delivery request failed.",
          detail: String(error && error.message ? error.message : error),
        },
        502,
        request,
        env,
        requestId
      );
    }

    const deliveryText = (await safeReadText(deliveryResponse)).slice(0, 4000);
    const deliveryJson = tryParseJson(deliveryText);

    if (!deliveryResponse.ok) {
      return jsonResponse(
        {
          ok: false,
          stage: "delivery_response",
          error: `Internal delivery failed (${deliveryResponse.status}).`,
          route: routeResult.route.key,
          destination: routeResult.route.destination,
          detail: deliveryJson || deliveryText || "No delivery response body.",
        },
        502,
        request,
        env,
        requestId
      );
    }

    return jsonResponse(
      {
        ok: true,
        stage: "accepted",
        accepted: true,
        route: routeResult.route.key,
        destination: routeResult.route.destination,
        request_id: requestId,
        delivery_status: deliveryResponse.status,
        delivery_response: deliveryJson || deliveryText || "OK",
      },
      200,
      request,
      env,
      requestId
    );
  },
};

const ROUTES = {
  root: "/",
  health: "/health",
  debugConfig: "/debug/config",
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
  return path === ROUTES.submitContact || path === ROUTES.submitCareers;
}

function resolveSubmissionRoute(path) {
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
  return { ok: false, status: 404, error: "Unknown submission route." };
}

function validateOpsAssetId(request, env) {
  const value = String(request.headers.get("x-ops-asset-id") || "").trim();

  if (!value) {
    return {
      ok: false,
      status: 403,
      error: "Missing x-ops-asset-id.",
    };
  }

  const configured = [
    String(env.ASSET_PAGE || "").trim(),
    String(env.ASSET_FOUND || "").trim(),
  ].filter(Boolean);

  if (!configured.length) {
    return { ok: true };
  }

  for (const expected of configured) {
    if (safeEqual(value, expected)) {
      return { ok: true };
    }
  }

  return {
    ok: false,
    status: 403,
    error: "Invalid x-ops-asset-id.",
  };
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
        "best_time_to_contact",
        "city",
        "state_province",
        "country_zip_code",
        "message",
        "experience_level",
        "education",
      ],
      listFields: ["contact_interest", "remote_interest", "remote_assistant_skills", "languages"],
      urlFields: [],
      aliases: {
        name: "full_name",
        email: "email_address",
        phone: "contact_number",
        "contact_interest[]": "contact_interest",
        "remote_interest[]": "remote_interest",
      },
    },
    careers: {
      required: [
        "full_name",
        "email_address",
        "country_code",
        "contact_number",
        "city",
        "state_province",
        "country_zip_code",
        "availability",
      ],
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
      listFields: ["career_interest", "experience_items", "languages", "skills", "projects", "education_items"],
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
    const raw = coerceTextValue(normalizedInput[field]);
    if (!raw) continue;

    const result = sanitizePlainText(raw, field);
    riskScore += result.score;

    if (result.notes.length) warnings.push({ field, notes: result.notes });

    if (result.blocked) {
      rejectedFields.push(field);
      continue;
    }

    if (result.value) cleaned[field] = result.value;
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
    const raw = coerceTextValue(normalizedInput[field]);
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
    if (!normalizedEmail) {
      rejectedFields.push("email_address");
    } else {
      cleaned.email_address = normalizedEmail;
    }
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

function decodeMaybeJsonList(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return value;
  if (typeof value !== "string") return value;

  const raw = value.trim();
  if (!raw) return "";

  const looksJson =
    (raw.startsWith("[") && raw.endsWith("]")) ||
    (raw.startsWith("{") && raw.endsWith("}"));

  if (!looksJson) return value;

  try {
    return JSON.parse(raw);
  } catch {
    return value;
  }
}

function sanitizeTextList(value, fieldName) {
  const notes = [];
  let score = 0;
  const items = [];

  const pushSanitized = (raw) => {
    const text = coerceTextValue(raw);
    if (!text) return;

    const result = sanitizePlainText(text, fieldName);
    score += result.score;

    if (result.notes.length) notes.push(...result.notes);
    if (!result.blocked && result.value) items.push(result.value);
  };

  const decoded = decodeMaybeJsonList(value);

  if (Array.isArray(decoded)) {
    for (const entry of decoded.slice(0, 50)) {
      pushSanitized(entry);
    }
  } else if (decoded && typeof decoded === "object") {
    pushSanitized(decoded);
  } else if (typeof decoded === "string") {
    const raw = decoded.trim();
    if (raw) {
      let parts = [raw];

      if (
        fieldName === "career_interest" ||
        fieldName === "contact_interest" ||
        fieldName === "remote_interest" ||
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

      for (const part of parts.slice(0, 50)) {
        pushSanitized(part);
      }
    }
  } else if (decoded != null) {
    pushSanitized(decoded);
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

  cleaned = cleaned.replace(/[<>]/g, "").replace(/\s{2,}/g, " ").trim();

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
    experience_items: 800,
    languages: 200,
    skills: 400,
    projects: 1000,
    education_items: 800,
    remote_assistant_skills: 300,
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

function coerceTextValue(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return value.map((item) => coerceTextValue(item)).filter(Boolean).join(" | ");
  }

  if (value && typeof value === "object") return flattenObjectValue(value);

  return "";
}

function flattenObjectValue(value) {
  const preferredKeys = [
    "name",
    "label",
    "title",
    "value",
    "text",
    "area",
    "language",
    "skill",
    "project",
    "school",
    "program",
    "certificate",
    "level",
    "company",
    "role",
    "description",
  ];

  const picked = [];

  for (const key of preferredKeys) {
    if (value[key] !== undefined && value[key] !== null && String(value[key]).trim() !== "") {
      picked.push(String(value[key]));
    }
  }

  if (picked.length) return picked.join(" - ");

  return Object.entries(value)
    .slice(0, 12)
    .map(([key, val]) => `${String(key)}: ${coerceTextValue(val)}`)
    .filter(Boolean)
    .join(", ");
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
  const allowed = parseCsv(env.ALLOWED_ORIGINS || "https://www.gabo.services,https://gabo.services");

  return allowed.length ? [...new Set(allowed)] : ["https://www.gabo.services", "https://gabo.services"];
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
  const requestedHeaders = String(request.headers.get("access-control-request-headers") || "").trim();
  const allowOrigin = originCheck.matched || allowed[0] || "https://www.gabo.services";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      requestedHeaders || "content-type, x-ops-asset-id, x-gabo-parent-origin",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin, Access-Control-Request-Headers",
    "Cache-Control": "no-store",
  };
}

function jsonResponse(data, status, request, env, requestId = "") {
  const payload = {
    request_id: requestId || crypto.randomUUID(),
    ...data,
  };

  return new Response(JSON.stringify(payload, null, 2), {
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
