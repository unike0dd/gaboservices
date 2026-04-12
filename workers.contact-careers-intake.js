/**
 * Cloudflare Worker: Contact + Careers intake router.
 *
 * Routes:
 * - POST /submit/contact  -> Gmail path (asset: ASSET_C5T)
 * - POST /submit/careers  -> Google Sheets path (asset: ASSET_C5S)
 *
 * Required secrets/bindings:
 * - ASSET_C5T (string)
 * - ASSET_C5S (string)
 * Optional:
 * - REMOTE_WORKER_URL (defaults to solitary-term worker)
 */

const DEFAULT_REMOTE_WORKER = 'https://solitary-term-4203.rulathemtodos.workers.dev';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    try {
      const url = new URL(request.url);
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed.' }, 405, request);
      }

      const routeConfig = resolveRoute(url.pathname, env);
      if (!routeConfig) {
        return json({ ok: false, error: 'Not found.' }, 404, request);
      }

      const body = await request.json();
      const sanitized = sanitizePayload(body);

      if (!sanitized.accepted) {
        return json({ ok: false, error: 'Payload rejected: non-plain-text content detected.' }, 422, request);
      }

      const relayUrl = env.REMOTE_WORKER_URL || DEFAULT_REMOTE_WORKER;
      const relayResponse = await fetch(`${relayUrl}/intake`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          source: routeConfig.source,
          asset: routeConfig.asset,
          channel: routeConfig.channel,
          metadata: {
            receivedAt: new Date().toISOString(),
            userAgent: request.headers.get('user-agent') || '',
            ipHint: request.headers.get('cf-connecting-ip') || ''
          },
          data: sanitized.data,
          scan: sanitized.scan
        })
      });

      if (!relayResponse.ok) {
        const detail = (await relayResponse.text()).slice(0, 300);
        return json({ ok: false, error: `Relay failed (${relayResponse.status})`, detail }, 502, request);
      }

      return json({ ok: true, source: routeConfig.source, channel: routeConfig.channel, forwarded: true }, 200, request);
    } catch (error) {
      return json({ ok: false, error: 'Unhandled intake error.', detail: String(error && error.message ? error.message : error) }, 500, request);
    }
  }
};

function resolveRoute(pathname, env) {
  if (pathname === '/submit/contact') {
    return { source: 'contact', channel: 'gmail', asset: env.ASSET_C5T || '' };
  }
  if (pathname === '/submit/careers') {
    return { source: 'careers', channel: 'gsheets', asset: env.ASSET_C5S || '' };
  }
  return null;
}

function sanitizePayload(input) {
  const scan = {
    removedTags: 0,
    removedCodeLike: 0,
    rejectedFields: []
  };

  const data = {};
  const fields = typeof input === 'object' && input ? input : {};
  const entries = Object.entries(fields);

  for (const [key, rawValue] of entries) {
    if (Array.isArray(rawValue)) {
      const cleanedArray = rawValue
        .map((item) => normalizeToText(item, scan, key))
        .filter(Boolean);
      data[key] = cleanedArray;
      continue;
    }

    if (rawValue === null || typeof rawValue === 'undefined') {
      data[key] = '';
      continue;
    }

    data[key] = normalizeToText(rawValue, scan, key);
  }

  const rejected = scan.rejectedFields.length > 0;
  return {
    accepted: !rejected,
    data,
    scan
  };
}

function normalizeToText(value, scan, key) {
  let text = String(value);

  const withoutTags = text.replace(/<[^>]*>/g, () => {
    scan.removedTags += 1;
    return ' ';
  });

  const codePattern = /(javascript:|data:text\/html|<script|function\s*\(|=>|\bSELECT\b|\bINSERT\b|\bDROP\b|\{\s*\$|\b(eval|document\.cookie|localStorage|sessionStorage)\b)/gi;
  const beforeCode = withoutTags;
  text = withoutTags.replace(codePattern, () => {
    scan.removedCodeLike += 1;
    return ' ';
  });

  // Plain/simple text allowlist.
  text = text.replace(/[^a-zA-Z0-9\s.,;:!?@#%&()\-_/+'"\n]/g, ' ');
  text = text.replace(/\s{2,}/g, ' ').trim();

  const lookedLikeCode = beforeCode !== text && /[{}<>;$`]/.test(beforeCode);
  if (lookedLikeCode || suspiciousDensity(beforeCode)) {
    scan.rejectedFields.push(key);
  }

  return text;
}

function suspiciousDensity(value) {
  if (!value) return false;
  const symbols = (value.match(/[{}<>;$`=]/g) || []).length;
  return symbols >= 6;
}

function json(payload, status, request) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(request)
    }
  });
}

function corsHeaders(request) {
  const origin = request.headers.get('origin') || '*';
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'origin'
  };
}
