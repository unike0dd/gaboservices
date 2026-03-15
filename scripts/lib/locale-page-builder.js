const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { upsertCanonical, rewriteAlternates } = require('./locale-head-utils');
const { normalizeRoute, getAlternateLocalePath } = require('./locale-route-map');

const ROOT = path.resolve(__dirname, '..', '..');

function parseLanguageCodes() {
  const file = path.join(ROOT, 'language-codes.js');
  if (!fs.existsSync(file)) {
    return {
      DICTIONARY: {},
      TRANSLATION_PAGE_MAP: {},
      getTranslationsBySection: () => ({})
    };
  }
  const src = fs.readFileSync(file, 'utf8');
  const transformed = src
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+function\s+/g, 'function ')
    .concat('\nmodule.exports = { DICTIONARY, TRANSLATION_PAGE_MAP, getTranslationsBySection };\n');

  const script = new vm.Script(transformed, { filename: 'language-codes.js' });
  const sandbox = { module: { exports: {} }, exports: {}, console };
  script.runInNewContext(sandbox);
  return sandbox.module.exports;
}

function parseLegalI18n() {
  const file = path.join(ROOT, 'assets/legal-i18n.js');
  const src = fs.readFileSync(file, 'utf8');

  const copyLiteral = extractAssignedObjectLiteral(src, 'COPY');
  const pageContentLiteral = extractAssignedObjectLiteral(src, 'PAGE_CONTENT');

  const copy = evaluateObjectLiteral(copyLiteral, 'COPY');
  const content = evaluateObjectLiteral(pageContentLiteral, 'PAGE_CONTENT');

  return { copy, content };
}

function extractAssignedObjectLiteral(src, variableName) {
  const marker = `const ${variableName} =`;
  const idx = src.indexOf(marker);
  if (idx === -1) return '{}';
  const start = src.indexOf('{', idx);
  if (start === -1) return '{}';

  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;

  for (let i = start; i < src.length; i += 1) {
    const ch = src[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (!inDouble && !inTemplate && ch === "'") inSingle = !inSingle;
    else if (!inSingle && !inTemplate && ch === '"') inDouble = !inDouble;
    else if (!inSingle && !inDouble && ch === '`') inTemplate = !inTemplate;

    if (inSingle || inDouble || inTemplate) continue;

    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return src.slice(start, i + 1);
      }
    }
  }

  return '{}';
}

function evaluateObjectLiteral(literal, label) {
  const script = new vm.Script(`module.exports = (${literal});`, { filename: `legal-${label}.js` });
  const sandbox = { module: { exports: {} }, exports: {} };
  script.runInNewContext(sandbox);
  return sandbox.module.exports;
}

function pick(src, regex) {
  const m = src.match(regex);
  return m ? m[1] : '';
}

function stripLanguageScripts(html) {
  return html
    .replace(/\n\s*<script[^>]+language-switcher\.js[^>]*><\/script>/gi, '')
    .replace(/\n\s*<script[^>]+main\.js[^>]*><\/script>/gi, '')
    .replace(/\n\s*<script[^>]+legal-i18n\.js[^>]*><\/script>/gi, '');
}

function pageKeyFromHtml(html, route) {
  const m = html.match(/<body[^>]*data-page-key=["']([^"']+)["']/i);
  if (m) return m[1];
  if (route.includes('/legal/terms')) return 'terms';
  if (route.includes('/legal/cookies')) return 'cookies';
  if (route.includes('/legal/privacy-gdpr')) return 'privacy';
  return '';
}

function buildCopy({ lang, pageKey, dictionary, pageMap, getTranslationsBySection }) {
  const base = dictionary[lang] || dictionary.en || {};
  if (!pageKey) return base;

  const normalized = pageKey;
  const sections = ['shared'];
  if (pageMap[normalized]) sections.push(normalized);

  return sections.reduce((acc, section) => ({
    ...acc,
    ...getTranslationsBySection(lang, section)
  }), { ...base });
}

function localizeDataI18n(html, copy, fallback) {
  html = html.replace(/(<[^>]+\sdata-i18n=["']([^"']+)["'][^>]*>)([\s\S]*?)(<\/[^>]+>)/g, (full, open, key, inner, close) => {
    const translated = copy[key] ?? fallback[key];
    if (!translated) return full;
    return `${open}${translated}${close}`;
  });

  html = html.replace(/(<[^>]+\sdata-i18n-(aria-label|placeholder|title|content)=["']([^"']+)["'][^>]*)(>)/g, (full, open, type, key, end) => {
    const translated = copy[key] ?? fallback[key];
    if (!translated) return full;
    const attr = type === 'aria-label' ? 'aria-label' : type;
    const attrPattern = new RegExp(`(^|\\s)${attr}=["'][^"']*["']`, 'i');
    if (attrPattern.test(open)) {
      return `${open.replace(attrPattern, `$1${attr}="${escapeAttr(translated)}"`)}${end}`;
    }
    return `${open} ${attr}="${escapeAttr(translated)}"${end}`;
  });

  return html;
}

function escapeAttr(value) {
  return String(value).replace(/"/g, '&quot;');
}

function rewriteLinks(html, lang) {
  return html.replace(/(<a[^>]*\shref=["'])([^"']+)(["'][^>]*>)/gi, (full, start, href, end) => {
    const rewritten = rewriteHref(href, lang);
    return `${start}${rewritten}${end}`;
  });
}

function rewriteHref(href, lang) {
  if (!href || href.startsWith('#')) return href;
  if (/^(mailto:|tel:|javascript:|https?:\/\/)/i.test(href)) {
    try {
      const u = new URL(href);
      if (u.hostname !== 'www.gabo.services' && u.hostname !== 'gabo.services') return href;
      return `/lang/${lang}${normalizeRoute(u.pathname) === '/' ? '/' : normalizeRoute(u.pathname)}`.replace(/\/legal\/([^/]+)\/$/, '/legal/$1.html');
    } catch {
      return href;
    }
  }

  let normalized = href;
  if (normalized.startsWith('./')) normalized = normalized.slice(1);
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;

  const url = new URL(`https://www.gabo.services${normalized}`);
  if (/\.[a-z0-9]+$/i.test(url.pathname) && !/\.html$/i.test(url.pathname)) {
    return url.pathname;
  }

  const route = normalizeRoute(url.pathname);

  let localized = getAlternateLocalePath(route, lang);
  if (route.startsWith('/legal/')) localized = localized.replace(/\/$/, '.html').replace('.html.html', '.html');

  return localized;
}

function removeLangQueryLinks(html) {
  return html.replace(/\?lang=(en|es)/gi, '');
}


function fixRelativeAssetPaths(html, sourceFile) {
  const baseDir = path.posix.dirname(sourceFile.replace(/\\/g, '/'));
  return html.replace(/(<(script|img|link)\b[^>]*?\s(?:src|href)=")([^"]+)("[^>]*>)/gi, (full, start, _tag, value, end) => {
    if (!value || value.startsWith('/') || value.startsWith('http') || value.startsWith('data:')) return full;
    if (value.startsWith('#')) return full;

    const resolved = path.posix.normalize(path.posix.join('/', baseDir, value));
    return `${start}${resolved}${end}`;
  });
}

function setHtmlLang(html, lang) {
  if (/<html[^>]*lang=/i.test(html)) {
    return html.replace(/<html([^>]*?)lang=["'][^"']+["']([^>]*)>/i, `<html$1lang="${lang}"$2>`);
  }
  return html.replace(/<html(.*?)>/i, `<html$1 lang="${lang}">`);
}

function setTitleAndDescription(html, title, description) {
  if (title) {
    if (/<title>[\s\S]*?<\/title>/i.test(html)) html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  }
  if (description) {
    if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
      html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeAttr(description)}" />`);
    }
  }
  return html;
}

function buildLocalePage({
  lang,
  route,
  sourceFile,
  outputFile,
  dictionaryData,
  legalData
}) {
  const sourcePath = path.join(ROOT, sourceFile);
  const outputPath = path.join(ROOT, outputFile);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  let html = fs.readFileSync(sourcePath, 'utf8');
  const pageKey = pageKeyFromHtml(html, route);
  const isLegal = route.startsWith('/legal/');

  html = stripLanguageScripts(html);
  html = setHtmlLang(html, lang);

  if (isLegal) {
    const legalKey = pageKey;
    const content = legalData.content[legalKey]?.[lang];
    if (content) {
      html = html.replace(/<main[^>]*class=["'][^"']*legal-main[^"']*["'][^>]*>[\s\S]*?<\/main>/i, (mainBlock) => {
        const open = mainBlock.match(/<main[^>]*>/i)?.[0] || '<main class="legal-main">';
        return `${open}\n${content}\n  </main>`;
      });
    }

    const c = legalData.copy[lang] || legalData.copy.en;
    const fallbackLegal = legalData.copy.en || {};
    html = localizeDataI18n(html, c, fallbackLegal);
    if (legalKey === 'terms') html = setTitleAndDescription(html, c.pageTermsTitle, c.pageTermsDescription);
    if (legalKey === 'cookies') html = setTitleAndDescription(html, c.pageCookiesTitle, c.pageCookiesDescription);
    if (legalKey === 'privacy') html = setTitleAndDescription(html, c.pagePrivacyTitle, c.pagePrivacyDescription);
  } else {
    const { DICTIONARY, TRANSLATION_PAGE_MAP, getTranslationsBySection } = dictionaryData;
    const copy = buildCopy({ lang, pageKey, dictionary: DICTIONARY, pageMap: TRANSLATION_PAGE_MAP, getTranslationsBySection });
    const fallback = DICTIONARY.en || {};
    html = localizeDataI18n(html, copy, fallback);
    html = setTitleAndDescription(html, copy.pageTitle || copy.pageTitleHome, copy.pageDescription);
  }

  html = rewriteLinks(html, lang);
  html = removeLangQueryLinks(html);
  html = fixRelativeAssetPaths(html, sourceFile);

  const canonicalPath = getAlternateLocalePath(route, lang);
  html = upsertCanonical(html, canonicalPath);
  html = rewriteAlternates(html, route, getAlternateLocalePath);

  fs.writeFileSync(outputPath, html);
}

module.exports = {
  parseLanguageCodes,
  parseLegalI18n,
  buildLocalePage
};
