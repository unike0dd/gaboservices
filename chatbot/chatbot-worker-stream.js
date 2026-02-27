const DEFAULT_WORKER_BASE_URL = 'https://con-artist.rulathemtodos.workers.dev/';
const CHAT_STREAM_ROUTE = '/api/chat';
const EMBED_ROUTE = '/embed';

function toCleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}


function withGatewayParam(embedUrl, gatewayUrl) {
  const cleanEmbed = toCleanString(embedUrl);
  const cleanGateway = toCleanString(gatewayUrl);
  if (!cleanEmbed) return cleanEmbed;
  if (!cleanGateway) return cleanEmbed;
  try {
    const parsed = new URL(cleanEmbed);
    if (!parsed.searchParams.get('gateway')) {
      parsed.searchParams.set('gateway', cleanGateway);
    }
    return parsed.toString();
  } catch {
    return cleanEmbed;
  }
}

export function normalizeWorkerBaseUrl(url = DEFAULT_WORKER_BASE_URL) {
  const candidate = toCleanString(url) || DEFAULT_WORKER_BASE_URL;
  try {
    const parsed = new URL(candidate);
    parsed.pathname = '/';
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return DEFAULT_WORKER_BASE_URL;
  }
}

export function buildWorkerChatStreamUrl(workerBaseUrl = DEFAULT_WORKER_BASE_URL) {
  return new URL(CHAT_STREAM_ROUTE, normalizeWorkerBaseUrl(workerBaseUrl)).toString();
}

export function buildWorkerEmbedUrl({ workerBaseUrl = DEFAULT_WORKER_BASE_URL, parentOrigin, gatewayUrl } = {}) {
  const embedUrl = new URL(EMBED_ROUTE, normalizeWorkerBaseUrl(workerBaseUrl));
  const parent = toCleanString(parentOrigin);
  if (parent) embedUrl.searchParams.set('parent', parent);

  const gateway = toCleanString(gatewayUrl) || buildWorkerChatStreamUrl(workerBaseUrl);
  embedUrl.searchParams.set('gateway', gateway);
  return embedUrl.toString();
}

export function resolveWorkerTargets(siteMetadata = window.SITE_METADATA || {}, parentOrigin = window.location.origin) {
  const workerBaseUrl = normalizeWorkerBaseUrl(siteMetadata.chatbotWorkerBaseUrl || siteMetadata.chatbotGatewayUrl || DEFAULT_WORKER_BASE_URL);
  const gatewayUrl = toCleanString(siteMetadata.chatbotGatewayUrl) || buildWorkerChatStreamUrl(workerBaseUrl);
  const embedUrl = withGatewayParam(
    toCleanString(siteMetadata.chatbotEmbedUrl) ||
      buildWorkerEmbedUrl({
        workerBaseUrl,
        parentOrigin,
        gatewayUrl
      }),
    gatewayUrl
  );

  return {
    workerBaseUrl,
    gatewayUrl,
    embedUrl
  };
}

export async function openDirectWorkerStream({ payload, signal, headers = {}, gatewayUrl = DEFAULT_WORKER_BASE_URL } = {}) {
  const streamUrl = buildWorkerChatStreamUrl(gatewayUrl);
  return fetch(streamUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'text/event-stream',
      ...headers
    },
    body: JSON.stringify(payload || {}),
    signal
  });
}

export const CHATBOT_STREAM_BRIDGE_NAME = 'chatbot-worker-stream.js';
