/**
 * Cloudflare Worker: Contact + Careers intake router.
 *
 * Routes
 * - POST /submit/contact  -> Gmail path (asset secret: ASSET_C5T)
 * - POST /submit/careers  -> Google Sheets path (asset secret: ASSET_C5S)
 *
 * Required secrets:
 * - ASSET_C5T
 * - ASSET_C5S
 *
 * Optional:
 * - REMOTE_WORKER_URL
 * - ALLOWED_ORIGINS (comma-separated list)
 */

const DEFAULT_REMOTE_WORKER = 'https://solitary-term-4203.rulathemtodos.workers.dev';
const MAX_PAYLOAD_BYTES = 40_000;

const ROUTE_CONFIG = {
  '/submit/contact': {
    source: 'contact',
    channel: 'gmail',
    assetSecretKey: 'ASSET_C5T',
    allowedFields: new Set([
      'full_name', 'email_address', 'space_suite_apt', 'country_code', 'contact_number',
      'contact_interest[]', 'best_time_to_contact', 'city', 'state_province', 'country_zip_code',
      'message', 'remote_interest[]', 'remote_assistant_skills', 'experience_level', 'languages', 'education'
    ])
  },
  '/submit/careers': {
    source: 'careers',
    channel: 'gsheets',
    assetSecretKey: 'ASSET_C5S',
    allowedFields: new Set([
      'full_name', 'email_address', 'country_code', 'contact_number', 'city', 'state_province',
      'country_zip_code', 'availability', 'career_interest[]', 'experience_items', 'languages',
      'skills', 'projects', 'education_items', 'resume_or_profile_link'
    ])
  }
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = parseAllowedOrigins(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, allowedOrigins)
      });
    }

    try {
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed.' }, 405, origin, allowedOrigins);
      }

      if (!isOriginAllowed(origin, allowedOrigins)) {
        return json({ ok: false, error: 'Origin not allowed.' }, 403, origin, allowedOrigins);
      }

      const url = new URL(request.url);
      const config = ROUTE_CONFIG[url.pathname];
      if (!config) {
        return json({ ok: false, error: 'Not found.' }, 404, origin, allowedOrigins);
      }

      const assetId = String(env[config.assetSecretKey] || '').trim();
      if (!isLikelyAssetId(assetId)) {
        return json({ ok: false, error: `Misconfigured secret ${config.assetSecretKey}.` }, 500, origin, allowedOrigins);
      }

      const contentLength = Number(request.headers.get('content-length') || '0');
      if (contentLength > MAX_PAYLOAD_BYTES) {
        return json({ ok: false, error: 'Payload too large.' }, 413, origin, allowedOrigins);
      }

      const body = await request.json();
      const sanitized = sanitizePayload(body, config.allowedFields);

      if (!sanitized.accepted) {
        return json(
          {
            ok: false,
            error: 'Payload rejected: non-plain-text or suspicious content detected.',
            rejectedFields: sanitized.scan.rejectedFields
          },
          422,
          origin,
          allowedOrigins
        );
      }

      const relayUrl = (env.REMOTE_WORKER_URL || DEFAULT_REMOTE_WORKER).replace(/\/$/, '');
      const relayResponse = await fetch(`${relayUrl}/intake`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          source: config.source,
          channel: config.channel,
          asset: assetId,
          metadata: {
            receivedAt: new Date().toISOString(),
            userAgent: request.headers.get('user-agent') || '',
            ipHashHint: hashIpHint(request.headers.get('cf-connecting-ip') || '')
          },
          data: sanitized.data,
          scan: sanitized.scan
        })
      });

      if (!relayResponse.ok) {
        const detail = (await relayResponse.text()).slice(0, 280);
        return json(
          { ok: false, error: `Relay failed (${relayResponse.status})`, detail },
          502,
          origin,
          allowedOrigins
        );
      }

      return json(
        {
          ok: true,
          source: config.source,
          channel: config.channel,
          forwarded: true,
          droppedFields: sanitized.scan.droppedFields
        },
        200,
        origin,
        allowedOrigins
      );
    } catch (error) {
      return json(
        { ok: false, error: 'Unhandled intake error.', detail: String(error && error.message ? error.message : error) },
        500,
        origin,
        allowedOrigins
      );
    }
  }
};

function sanitizePayload(input, allowedFields) {
  const scan = {
    removedTags: 0,
    removedCodeLike: 0,
    suspiciousScore: 0,
    rejectedFields: [],
    droppedFields: []
  };

  const source = typeof input === 'object' && input ? input : {};
  const data = {};

  for (const [key, rawValue] of Object.entries(source)) {
    if (!allowedFields.has(key)) {
      scan.droppedFields.push(key);
      continue;
    }

    if (Array.isArray(rawValue)) {
      const cleanedItems = rawValue
        .map((item) => normalizeToText(item, scan, key))
        .filter(Boolean);
      data[key] = cleanedItems;
      continue;
    }

    data[key] = normalizeToText(rawValue, scan, key);
  }

  const accepted = scan.rejectedFields.length === 0;
  return { accepted, data, scan };
}

function normalizeToText(value, scan, key) {
  let text = String(value ?? '');

  text = text.replace(/<[^>]*>/g, () => {
    scan.removedTags += 1;
    scan.suspiciousScore += 2;
    return ' ';
  });

  const codePattern = /(javascript:|data:text\/html|<script|function\s*\(|=>|\bSELECT\b|\bINSERT\b|\bDROP\b|\bUNION\b|\b(eval|document\.cookie|localStorage|sessionStorage|onerror|onload)\b)/gi;
  text = text.replace(codePattern, () => {
    scan.removedCodeLike += 1;
    scan.suspiciousScore += 3;
    return ' ';
  });

  text = text.replace(/[^a-zA-Z0-9\s.,;:!?@#%&()\-_/+'"\n]/g, ' ');
  text = text.replace(/\s{2,}/g, ' ').trim();

  const density = suspiciousDensity(text);
  if (density >= 6 || scan.suspiciousScore >= 12) {
    scan.rejectedFields.push(key);
  }

  return text;
}

function suspiciousDensity(value) {
  if (!value) return 0;
  return (value.match(/[{}<>;$`=]/g) || []).length;
}

function isLikelyAssetId(value) {
  return /^[a-f0-9]{32,}$/i.test(value);
}

function parseAllowedOrigins(env) {
  const raw = String(env.ALLOWED_ORIGINS || 'https://www.gabo.services,https://gabo.services');
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
}

function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

function hashIpHint(ip) {
  if (!ip) return '';
  let hash = 0;
  for (let i = 0; i < ip.length; i += 1) {
    hash = ((hash << 5) - hash + ip.charCodeAt(i)) | 0;
  }
  return `ip_${Math.abs(hash)}`;
}

function json(payload, status, origin, allowedOrigins) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(origin, allowedOrigins)
    }
  });
}

function corsHeaders(origin, allowedOrigins) {
  const safeOrigin = isOriginAllowed(origin, allowedOrigins) ? origin : 'null';
  return {
    'access-control-allow-origin': safeOrigin,
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'origin'
  };
}
