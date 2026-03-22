const DEFAULT_WORKER_BASE_URL = 'https://con-artist.rulathemtodos.workers.dev/';
const CHAT_STREAM_ROUTE = '/api/chat';
const EMBED_ROUTE = '/embed';

function toCleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
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
  embedUrl.searchParams.set('parent', toCleanString(parentOrigin) || window.location.origin);
  embedUrl.searchParams.set('hideTenant', 'true');

  const gateway = toCleanString(gatewayUrl) || buildWorkerChatStreamUrl(workerBaseUrl);
  embedUrl.searchParams.set('gateway', gateway);
  return embedUrl.toString();
}

export function resolveWorkerTargets(siteMetadata = window.SITE_METADATA || {}, parentOrigin = window.location.origin) {
  const gatewayOrigin = toCleanString(window.SITE_METADATA?.chatbotGatewayUrl) || toCleanString(siteMetadata.chatbotGatewayUrl) || DEFAULT_WORKER_BASE_URL;
  const parent = window.location.origin || parentOrigin;
  const workerBaseUrl = normalizeWorkerBaseUrl(gatewayOrigin);
  const gatewayUrl = buildWorkerChatStreamUrl(workerBaseUrl);
  const embedUrl = buildWorkerEmbedUrl({
    workerBaseUrl,
    parentOrigin: parent,
    gatewayUrl
  });

  return {
    workerBaseUrl,
    gatewayUrl,
    embedUrl
  };
}


export const CHATBOT_STREAM_BRIDGE_NAME = 'chatbot-worker-stream.js';
