#!/usr/bin/env node
const { SOURCE_ROUTES, getLocaleOutputPath } = require('./lib/locale-route-map');
const { parseLanguageCodes, parseLegalI18n, buildLocalePage } = require('./lib/locale-page-builder');

function main() {
  const dictionaryData = parseLanguageCodes();
  const legalData = parseLegalI18n();

  SOURCE_ROUTES.forEach((entry) => {
    buildLocalePage({
      lang: 'es',
      route: entry.route,
      sourceFile: entry.source,
      outputFile: getLocaleOutputPath('es', entry.output),
      dictionaryData,
      legalData
    });
  });

  console.log(`Generated ${SOURCE_ROUTES.length} ES locale pages under /lang/es`);
}

main();
