const DEFAULT_WORKER_BASE_URL = 'https://con-artist.rulathemtodos.workers.dev/';
const CHAT_STREAM_ROUTE = '/api/chat';
const EMBED_ROUTE = '/embed';

function toCleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveGatewayFromMetadata(siteMetadata = {}) {
  const chatbotGatewayFromFeature = toCleanString(siteMetadata?.chatbot?.gatewayUrl);
  const chatbotGatewayFromLegacy = toCleanString(siteMetadata?.chatbotGatewayUrl);
  const globalFeatureGateway = toCleanString(window.SITE_METADATA?.chatbot?.gatewayUrl);
  const globalLegacyGateway = toCleanString(window.SITE_METADATA?.chatbotGatewayUrl);

  return chatbotGatewayFromFeature || chatbotGatewayFromLegacy || globalFeatureGateway || globalLegacyGateway || DEFAULT_WORKER_BASE_URL;
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

export function buildWorkerEmbedUrl({ workerBaseUrl = DEFAULT_WORKER_BASE_URL, parentOrigin } = {}) {
  const embedUrl = new URL(EMBED_ROUTE, normalizeWorkerBaseUrl(workerBaseUrl));
  embedUrl.searchParams.set('parent', toCleanString(parentOrigin) || window.location.origin);
  return embedUrl.toString();
}

export function resolveWorkerTargets(siteMetadata = window.SITE_METADATA || {}, parentOrigin = window.location.origin) {
  const gatewayOrigin = resolveGatewayFromMetadata(siteMetadata);
  const parent = window.location.origin || parentOrigin;
  const workerBaseUrl = normalizeWorkerBaseUrl(gatewayOrigin);

  return {
    workerBaseUrl,
    gatewayUrl: buildWorkerChatStreamUrl(workerBaseUrl),
    embedUrl: buildWorkerEmbedUrl({ workerBaseUrl, parentOrigin: parent })
  };
}
