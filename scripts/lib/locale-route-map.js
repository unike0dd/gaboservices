const LOCALE_ROOT = 'locale';

const SOURCE_ROUTES = [
  { route: '/', source: 'index.html', output: 'index.html' },
  { route: '/about/', source: 'about/index.html', output: 'about/index.html' },
  { route: '/services/', source: 'services/index.html', output: 'services/index.html' },
  { route: '/services/logistics-operations/', source: 'services/logistics-operations/index.html', output: 'services/logistics-operations/index.html' },
  { route: '/services/administrative-backoffice/', source: 'services/administrative-backoffice/index.html', output: 'services/administrative-backoffice/index.html' },
  { route: '/services/customer-relations/', source: 'services/customer-relations/index.html', output: 'services/customer-relations/index.html' },
  { route: '/services/it-support/', source: 'services/it-support/index.html', output: 'services/it-support/index.html' },
  { route: '/pricing/', source: 'pricing/index.html', output: 'pricing/index.html' },
  { route: '/careers/', source: 'careers/index.html', output: 'careers/index.html' },
  { route: '/contact/', source: 'contact/index.html', output: 'contact/index.html' },
  { route: '/learning/', source: 'learning/index.html', output: 'learning/index.html' },
  { route: '/legal/terms', source: 'legal/terms.html', output: 'legal/terms.html' },
  { route: '/legal/cookies', source: 'legal/cookies.html', output: 'legal/cookies.html' },
  { route: '/legal/privacy-gdpr', source: 'legal/privacy-gdpr.html', output: 'legal/privacy-gdpr.html' }
];

function normalizeRoute(route) {
  if (!route) return '/';
  if (route.endsWith('.html')) {
    const withoutExt = route.replace(/\.html$/i, '');
    return withoutExt === '/index' ? '/' : withoutExt;
  }
  if (route.startsWith('/legal/')) return route.replace(/\/+$/, '');
  return route.endsWith('/') ? route : `${route}/`;
}

function localePath(locale, route) {
  const normalized = normalizeRoute(route);
  if (normalized === '/') return `/${LOCALE_ROOT}/${locale}/`;
  if (normalized.startsWith('/legal/')) {
    return `/${LOCALE_ROOT}/${locale}${normalized}.html`;
  }
  return `/${LOCALE_ROOT}/${locale}${normalized}`;
}

function getLocaleOutputPath(locale, sourceFile) {
  return `${LOCALE_ROOT}/${locale}/${sourceFile}`;
}

function getEnPath(route) {
  return localePath('en', route);
}

function getEsPath(route) {
  return localePath('es', route);
}

function getAlternateLocalePath(route, locale) {
  return locale === 'en' ? getEnPath(route) : getEsPath(route);
}

module.exports = {
  LOCALE_ROOT,
  SOURCE_ROUTES,
  normalizeRoute,
  localePath,
  getEnPath,
  getEsPath,
  getAlternateLocalePath,
  getLocaleOutputPath
};
