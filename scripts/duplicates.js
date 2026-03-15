#!/usr/bin/env node
const { SOURCE_ROUTES, getLocaleOutputPath } = require('./lib/locale-route-map');
const { parseLanguageCodes, parseLegalI18n, buildLocalePage } = require('./lib/locale-page-builder');

function parseLocales(argv) {
  const locales = argv.filter(Boolean);
  return locales.length ? locales : ['en', 'es'];
}

function buildLocalePages(lang, dictionaryData, legalData) {
  SOURCE_ROUTES.forEach((entry) => {
    buildLocalePage({
      lang,
      route: entry.route,
      sourceFile: entry.source,
      outputFile: getLocaleOutputPath(lang, entry.output),
      dictionaryData,
      legalData
    });
  });

  console.log(`Generated ${SOURCE_ROUTES.length} ${lang.toUpperCase()} locale pages under /${lang}`);
}

function main() {
  const locales = parseLocales(process.argv.slice(2));
  const dictionaryData = parseLanguageCodes();
  const legalData = parseLegalI18n();

  locales.forEach((lang) => buildLocalePages(lang, dictionaryData, legalData));
}

main();
