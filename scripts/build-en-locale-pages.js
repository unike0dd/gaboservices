#!/usr/bin/env node
const { SOURCE_ROUTES, getLocaleOutputPath } = require('./lib/locale-route-map');
const { parseLanguageCodes, parseLegalI18n, buildLocalePage } = require('./lib/locale-page-builder');

function main() {
  const dictionaryData = parseLanguageCodes();
  const legalData = parseLegalI18n();

  SOURCE_ROUTES.forEach((entry) => {
    buildLocalePage({
      lang: 'en',
      route: entry.route,
      sourceFile: entry.source,
      outputFile: getLocaleOutputPath('en', entry.output),
      dictionaryData,
      legalData
    });
  });

  console.log(`Generated ${SOURCE_ROUTES.length} EN locale pages under /en`);
}

main();
