import { SITE_METADATA_DEFAULTS } from './site-metadata-defaults.js';
import { getActiveLocale } from './locales/index.js';

export const ACTIVE_LOCALE = getActiveLocale();

function mergeSiteMetadata(siteMetadata = {}) {
  return {
    ...SITE_METADATA_DEFAULTS,
    ...siteMetadata,
    seo: {
      ...SITE_METADATA_DEFAULTS.seo,
      ...(siteMetadata.seo || {}),
      structuredData: {
        ...SITE_METADATA_DEFAULTS.seo.structuredData,
        ...(siteMetadata.seo?.structuredData || {})
      }
    },
    security: {
      ...SITE_METADATA_DEFAULTS.security,
      ...(siteMetadata.security || {})
    },
    media: {
      ...SITE_METADATA_DEFAULTS.media,
      ...(siteMetadata.media || {}),
      allowedEmbeds: {
        ...SITE_METADATA_DEFAULTS.media.allowedEmbeds,
        ...(siteMetadata.media?.allowedEmbeds || {})
      }
    }
  };
}

export function getSiteMetadata() {
  return mergeSiteMetadata(window.SITE_METADATA || {});
}

export function getFrozenSiteMetadata() {
  const metadata = getSiteMetadata();
  return Object.freeze({
    ...metadata,
    seo: Object.freeze({
      ...metadata.seo,
      structuredData: Object.freeze({ ...(metadata.seo?.structuredData || {}) })
    }),
    security: Object.freeze({ ...(metadata.security || {}) }),
    media: Object.freeze({
      ...metadata.media,
      allowedEmbeds: Object.freeze({ ...(metadata.media?.allowedEmbeds || {}) })
    })
  });
}

export function getLocalizedValue(value, locale = ACTIVE_LOCALE) {
  if (value && typeof value === 'object') {
    if (value[locale]) return value[locale];
    if (value.en) return value.en;
    const firstAvailable = Object.values(value).find((entry) => typeof entry === 'string' && entry.trim().length > 0);
    if (firstAvailable) return firstAvailable;
  }
  return typeof value === 'string' ? value : '';
}
