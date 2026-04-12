export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(request, env),
      });
    }

    if (url.pathname === "/health") {
      return jsonResponse(
        {
          ok: true,
          worker: "solitary-term",
          routes: ["/ingest", "/intake", "/health"],
          accepts: ["application/json"],
        },
        200,
        request,
        env
      );
    }

    if (request.method !== "POST" || !isIngestPath(url.pathname)) {
      return jsonResponse({ ok: false, error: "Not found." }, 404, request, env);
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
      request.headers.get("x-ops-asset-id") || request.headers.get("x-intake-asset") || ""
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
      const contentType = (request.headers.get("content-type") || "").toLowerCase();

      if (!contentType.includes("application/json")) {
        return jsonResponse(
          { ok: false, error: "Expected application/json." },
          415,
          request,
          env
        );
      }

      incoming = await request.json();
    } catch {
      return jsonResponse(
        { ok: false, error: "Invalid JSON body." },
        400,
        request,
        env
      );
    }

    const cleanedResult = cleanAndValidatePayload(route.key, incoming);

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

    return jsonResponse(
      {
        ok: true,
        accepted: true,
        route: route.key,
        destination: route.destination,
        asset_name: route.assetName,
        received_at: new Date().toISOString(),
        payload: cleanedResult.payload,
        screening: {
          risk_score: cleanedResult.riskScore,
          warnings: cleanedResult.warnings,
          sanitizer: "plain-text-only",
        },
      },
      200,
      request,
      env
    );
  },
};

function isIngestPath(pathname) {
  return pathname === "/ingest" || pathname === "/intake";
}

function resolveRouteByAsset(assetId, env) {
  if (safeEqual(assetId, String(env.ASSET_C5T || ""))) {
    return {
      key: "contact",
      destination: "gmail",
      assetName: "ASSET_C5T",
    };
  }

  if (safeEqual(assetId, String(env.ASSET_C5S || ""))) {
    return {
      key: "careers",
      destination: "gsheets",
      assetName: "ASSET_C5S",
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

  const fieldMap = {
    contact: {
      allowed: ["name", "email", "phone", "company", "subject", "message"],
      required: ["name", "email", "message"],
    },
    careers: {
      allowed: [
        "name",
        "email",
        "phone",
        "city",
        "role",
        "experience",
        "linkedin",
        "portfolio",
        "message",
      ],
      required: ["name", "email", "message"],
    },
  };

  const spec = fieldMap[routeKey];
  const cleaned = {};
  const warnings = [];
  const rejectedFields = [];
  let riskScore = 0;

  for (const field of spec.allowed) {
    const raw = coerceToString(input[field]);
    if (!raw) continue;

    const result = sanitizePlainText(raw, field);
    riskScore += result.score;

    if (result.notes.length) {
      warnings.push({ field, notes: result.notes });
    }

    if (result.blocked) {
      rejectedFields.push(field);
      continue;
    }

    if (!result.value) continue;

    cleaned[field] = result.value;
  }

  if (cleaned.email) {
    const normalizedEmail = normalizeEmail(cleaned.email);
    if (!normalizedEmail) rejectedFields.push("email");
    else cleaned.email = normalizedEmail;
  }

  if (cleaned.phone) {
    cleaned.phone = normalizePhone(cleaned.phone);
  }

  if (cleaned.linkedin) {
    const linkedin = normalizeUrl(cleaned.linkedin);
    if (!linkedin) rejectedFields.push("linkedin");
    else cleaned.linkedin = linkedin;
  }

  if (cleaned.portfolio) {
    const portfolio = normalizeUrl(cleaned.portfolio);
    if (!portfolio) rejectedFields.push("portfolio");
    else cleaned.portfolio = portfolio;
  }

  for (const field of spec.required) {
    if (!cleaned[field]) {
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
    {
      regex: /localstorage|sessionstorage/i,
      weight: 3,
      note: "browser storage access detected",
    },
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

function normalizePhone(value) {
  return String(value || "")
    .replace(/[^\d+()\-\s]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 40);
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

function originAllowed(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowlist = parseCsv(
    env.ALLOWED_ORIGINS || "https://www.gabo.services,https://gabo.services"
  );

  return allowlist.includes(origin);
}

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function buildCorsHeaders(request, env) {
  const requestOrigin = request.headers.get("origin");
  const allowed = parseCsv(
    env.ALLOWED_ORIGINS || "https://www.gabo.services,https://gabo.services"
  );

  let allowOrigin = allowed[0] || "*";

  if (requestOrigin && allowed.includes(requestOrigin)) {
    allowOrigin = requestOrigin;
  }

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type, x-ops-asset-id, x-intake-asset",
    "access-control-max-age": "86400",
    "cache-control": "no-store",
    vary: "Origin",
  };
}

function jsonResponse(data, status, request, env) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...buildCorsHeaders(request, env),
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
