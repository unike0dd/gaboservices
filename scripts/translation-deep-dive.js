#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LOCALES = ['en', 'es'];
const TRANSLATION_HINT = /(\bDICTIONARY\b|\bSUPPORTED_LANGUAGES\b|\bTRANSLATION_PAGE_MAP\b|\blanguage-switcher\b|\blegal-i18n\b|\blocale\b|\bhreflang\b|\bdata-i18n\b|\blang\b)/i;

function listFiles(dir, extension) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(full, extension));
      continue;
    }

    if (entry.isFile() && full.endsWith(extension)) {
      files.push(full);
    }
  }

  return files;
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function normalizeRouteFromLocaleFile(locale, localeFilePath) {
  const relative = path.relative(path.join(ROOT, locale), localeFilePath).replace(/\\/g, '/');
  if (relative === 'index.html') return '/';
  if (relative.startsWith('legal/') && relative.endsWith('.html')) {
    return `/${relative.replace(/\.html$/i, '')}`;
  }
  return `/${relative.replace(/index\.html$/i, '')}`;
}

function extractHeadMeta(html) {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["'][^>]*>/i);

  return {
    title: (titleMatch?.[1] || '').trim(),
    description: (descriptionMatch?.[1] || '').trim()
  };
}

function collectPageTranslations() {
  const perLocale = {};

  for (const locale of LOCALES) {
    const localeRoot = path.join(ROOT, locale);
    if (!fs.existsSync(localeRoot)) {
      perLocale[locale] = [];
      process.stderr.write(`[translation-deep-dive] Skipping missing locale directory: ${localeRoot}\n`);
      continue;
    }

    const htmlFiles = listFiles(localeRoot, '.html');
    perLocale[locale] = htmlFiles.map((file) => {
      const html = readText(file);
      const route = normalizeRouteFromLocaleFile(locale, file);
      const head = extractHeadMeta(html);

      return {
        route,
        file: path.relative(ROOT, file).replace(/\\/g, '/'),
        title: head.title,
        description: head.description
      };
    });
  }

  const pageByRoute = new Map();

  for (const locale of LOCALES) {
    for (const page of perLocale[locale]) {
      const current = pageByRoute.get(page.route) || { route: page.route };
      current[locale] = {
        file: page.file,
        title: page.title,
        description: page.description
      };
      pageByRoute.set(page.route, current);
    }
  }

  return [...pageByRoute.values()].sort((a, b) => a.route.localeCompare(b.route));
}

function collectTranslationHelperScripts() {
  const jsFiles = listFiles(ROOT, '.js')
    .filter((file) => !file.includes('/node_modules/'))
    .map((file) => path.resolve(file));

  return jsFiles
    .map((file) => {
      const relative = path.relative(ROOT, file).replace(/\\/g, '/');
      const source = readText(file);
      if (!TRANSLATION_HINT.test(source)) return null;

      const matchedHints = Array.from(
        new Set(
          [...source.matchAll(/DICTIONARY|SUPPORTED_LANGUAGES|TRANSLATION_PAGE_MAP|language-switcher|legal-i18n|locale|hreflang|data-i18n|\blang\b/gi)]
            .map((m) => m[0])
        )
      );

      return {
        file: relative,
        sizeBytes: Buffer.byteLength(source, 'utf8'),
        matchedHints,
        source
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.file.localeCompare(b.file));
}

function buildBundle() {
  return {
    generatedAt: new Date().toISOString(),
    locales: LOCALES,
    pageTranslations: collectPageTranslations(),
    translationHelperScripts: collectTranslationHelperScripts()
  };
}

function printAsJavaScript(bundle) {
  const payload = JSON.stringify(bundle, null, 2);
  const script = `/* eslint-disable */\n// Auto-generated deep-dive translation bundle\nconst TRANSLATION_DEEP_DIVE = ${payload};\n\nif (typeof module !== 'undefined') {\n  module.exports = TRANSLATION_DEEP_DIVE;\n}\n\nif (typeof window !== 'undefined') {\n  window.TRANSLATION_DEEP_DIVE = TRANSLATION_DEEP_DIVE;\n}\n`;
  process.stdout.write(script);
}

const bundle = buildBundle();
printAsJavaScript(bundle);
