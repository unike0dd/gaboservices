import { SITE_METADATA_DEFAULTS } from './site-metadata-defaults.js';

const governance = (() => {
  const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

  const hasSiteMetadata = () => {
    const siteMetadata = window.SITE_METADATA;
    return Boolean(siteMetadata && typeof siteMetadata === 'object' && Object.keys(siteMetadata).length);
  };

  const getMetadata = () => {
    const siteMetadata = window.SITE_METADATA || {};

    return Object.freeze({
      ...SITE_METADATA_DEFAULTS,
      ...siteMetadata,
      seo: Object.freeze({
        ...SITE_METADATA_DEFAULTS.seo,
        ...(siteMetadata.seo || {}),
        structuredData: Object.freeze({
          ...SITE_METADATA_DEFAULTS.seo.structuredData,
          ...(siteMetadata.seo?.structuredData || {})
        })
      }),
      security: Object.freeze({
        ...SITE_METADATA_DEFAULTS.security,
        ...(siteMetadata.security || {})
      }),
      media: Object.freeze({
        ...SITE_METADATA_DEFAULTS.media,
        ...(siteMetadata.media || {}),
        allowedEmbeds: Object.freeze({
          ...SITE_METADATA_DEFAULTS.media.allowedEmbeds,
          ...(siteMetadata.media?.allowedEmbeds || {})
        })
      }),
      voiceSearch: Object.freeze({
        ...SITE_METADATA_DEFAULTS.voiceSearch,
        ...(siteMetadata.voiceSearch || {})
      })
    });
  };

  const getSeo = () => Object.freeze(getMetadata().seo || {});
  const getSecurity = () => Object.freeze(getMetadata().security || {});
  const getMedia = () => Object.freeze(getMetadata().media || {});
  const getVoiceSearch = () => Object.freeze(getMetadata().voiceSearch || {});

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

  const syncSeoTags = () => {
    const seo = getSeo();
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

  const cspBlocksInlineStructuredData = () => {
    const policy = document
      .querySelector('meta[http-equiv="Content-Security-Policy"]')
      ?.getAttribute('content');

    if (!policy) return false;

    const scriptSrcElemMatch = policy.match(/script-src-elem\s+([^;]+)/i);
    const scriptSrcMatch = policy.match(/script-src\s+([^;]+)/i);
    const sourceText = scriptSrcElemMatch?.[1] || scriptSrcMatch?.[1] || '';

    if (!sourceText) return false;

    return !/('unsafe-inline'|'nonce-[^']+'|'sha(256|384|512)-[^']+')/i.test(sourceText);
  };

  const injectStructuredData = () => {
    const seo = getSeo();
    if (!seo.structuredData || cspBlocksInlineStructuredData()) return;

    const script = document.querySelector('script[data-governance-schema="organization"]');
    if (!script) return;

    script.textContent = JSON.stringify(seo.structuredData);
  };

  const runSelfAudit = () => {
    const findings = [];
    const security = getSecurity();
    const media = getMedia();
    const voiceSearch = getVoiceSearch();

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

    if (hasSiteMetadata() && !security.cspProfile) {
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

  let initialized = false;

  const init = () => {
    if (initialized) return [];
    initialized = true;
    syncSeoTags();
    injectStructuredData();
    return runSelfAudit();
  };

  return Object.freeze({
    init,
    get config() {
      return Object.freeze({
        seo: getSeo(),
        security: getSecurity(),
        media: getMedia(),
        voiceSearch: getVoiceSearch()
      });
    }
  });
})();

window.__SITE_GOVERNANCE__ = governance;

export function initSiteGovernance() {
  return governance.init();
}
