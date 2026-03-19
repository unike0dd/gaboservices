const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

const getMetadata = () => Object.freeze(window.SITE_METADATA || {});
const getSeoConfig = (metadata) => Object.freeze(metadata.seo || {});
const getSecurityConfig = (metadata) => Object.freeze(metadata.security || {});
const getMediaConfig = (metadata) => Object.freeze(metadata.media || {});
const getVoiceSearchConfig = (metadata) => Object.freeze(metadata.voiceSearch || {});

const setMetaContent = (selector, content) => {
  if (!content) return;
  const node = document.querySelector(selector);
  if (node) node.setAttribute('content', content);
};

const setLinkHref = (selector, href) => {
  if (!href) return;
  const node = document.querySelector(selector);
  if (node) node.setAttribute('href', href);
};

const syncSeoTags = (seo) => {
  const title = seo.title || document.title;
  const description = seo.description || '';
  const canonicalUrl = seo.canonicalUrl || '';
  const previewImage = seo.previewImage || '';

  if (title) {
    document.title = title;
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[name="twitter:title"]', title);
  }

  if (description) {
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[name="twitter:description"]', description);
  }

  if (canonicalUrl) {
    setLinkHref('link[rel="canonical"]', canonicalUrl);
    setMetaContent('meta[property="og:url"]', canonicalUrl);
  }

  if (previewImage) {
    setMetaContent('meta[property="og:image"]', previewImage);
    setMetaContent('meta[name="twitter:image"]', previewImage);
  }
};

const injectStructuredData = (seo) => {
  if (!seo.structuredData) return;

  const existing = document.querySelector('script[data-governance-schema="organization"]');
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.governanceSchema = 'organization';
  script.textContent = JSON.stringify(seo.structuredData);
  document.head.appendChild(script);
};

const runSelfAudit = (security, media, voiceSearch) => {
  const findings = [];

  if (!document.querySelector('meta[name="description"]')) {
    findings.push('Missing meta description.');
  }

  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (!canonical || !ABSOLUTE_URL_PATTERN.test(canonical)) {
    findings.push('Canonical URL should be absolute.');
  }

  if (!document.querySelector('meta[property="og:title"]')) {
    findings.push('Missing Open Graph title tag.');
  }

  if (!document.querySelector('meta[name="twitter:card"]')) {
    findings.push('Missing Twitter card tag.');
  }

  if (!security.cspProfile) {
    findings.push('No CSP profile declared in site config.');
  }

  if (voiceSearch.enabled && !voiceSearch.lang) {
    findings.push('Voice search is enabled, but no language code is configured.');
  }

  if (media.allowedEmbeds?.youtube && !security.allowlistedFrameHosts?.includes('https://www.youtube-nocookie.com')) {
    findings.push('YouTube embeds should be paired with youtube-nocookie allowlisting in CSP/frame-src.');
  }

  if (findings.length) {
    console.warn('[governance] Review recommended:', findings);
  }

  return findings;
};

const init = () => {
  const metadata = getMetadata();
  const seo = getSeoConfig(metadata);
  const security = getSecurityConfig(metadata);
  const media = getMediaConfig(metadata);
  const voiceSearch = getVoiceSearchConfig(metadata);

  syncSeoTags(seo);
  injectStructuredData(seo);

  return runSelfAudit(security, media, voiceSearch);
};

const governance = Object.freeze({
  init,
  get config() {
    const metadata = getMetadata();
    return Object.freeze({
      seo: getSeoConfig(metadata),
      security: getSecurityConfig(metadata),
      media: getMediaConfig(metadata),
      voiceSearch: getVoiceSearchConfig(metadata)
    });
  }
});

window.__SITE_GOVERNANCE__ = governance;

export function initSiteGovernance() {
  return governance.init();
}
