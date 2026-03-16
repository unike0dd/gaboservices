const BASE_URL = 'https://www.gabo.services';

function absolute(pathname) {
  return `${BASE_URL}${pathname}`;
}

function upsertCanonical(html, canonicalPath) {
  const canonicalTag = `<link rel="canonical" href="${absolute(canonicalPath)}" />`;
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonicalTag);
  }
  return html.replace(/<\/head>/i, `    ${canonicalTag}\n  </head>`);
}

function rewriteAlternates(html, route, localePathFn) {
  const enHref = absolute(localePathFn(route, 'en'));
  const esHref = absolute(localePathFn(route, 'es'));
  const xDefaultHref = absolute('/');

  html = html.replace(/\s*<link\s+rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>\s*/gi, '\n');

  const alternates = [
    `<link rel="alternate" hreflang="en" href="${enHref}" />`,
    `<link rel="alternate" hreflang="es" href="${esHref}" />`,
    `<link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`
  ].join('\n    ');

  return html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, (canonical) => `${canonical}\n    ${alternates}`);
}

module.exports = {
  upsertCanonical,
  rewriteAlternates
};
