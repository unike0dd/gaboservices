#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const CRITICAL_ROOT_KEYS = ['nav', 'fab', 'mobileBottomNav', 'cookieConsent'];

function parseArgs(argv) {
  const args = { report: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--report' && argv[i + 1]) {
      args.report = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function flattenMessageKeys(source, base = '', acc = []) {
  if (!isPlainObject(source)) return acc;

  for (const [key, value] of Object.entries(source)) {
    const pathKey = base ? `${base}.${key}` : key;
    if (isPlainObject(value)) {
      flattenMessageKeys(value, pathKey, acc);
      continue;
    }
    acc.push(pathKey);
  }

  return acc;
}

function collectInvalidLeafValues(source, locale, base = '', acc = []) {
  if (!isPlainObject(source)) {
    acc.push({
      locale,
      key: base || '(root)',
      reason: 'Locale payload must be an object'
    });
    return acc;
  }

  for (const [key, value] of Object.entries(source)) {
    const pathKey = base ? `${base}.${key}` : key;
    if (isPlainObject(value)) {
      collectInvalidLeafValues(value, locale, pathKey, acc);
      continue;
    }

    if (typeof value !== 'string' || !value.trim()) {
      acc.push({
        locale,
        key: pathKey,
        reason: 'Leaf values must be non-empty strings'
      });
    }
  }

  return acc;
}

function filterCriticalKeys(flatKeys) {
  return flatKeys.filter((k) => CRITICAL_ROOT_KEYS.some((rootKey) => k === rootKey || k.startsWith(`${rootKey}.`)));
}

function makeReport({
  missingCriticalInEs,
  missingCriticalInEn,
  invalidValues
}) {
  const hasErrors =
    missingCriticalInEs.length > 0 ||
    missingCriticalInEn.length > 0 ||
    invalidValues.length > 0;

  return {
    status: hasErrors ? 'error' : 'ok',
    checkedAt: new Date().toISOString(),
    checkedScopes: CRITICAL_ROOT_KEYS,
    missingCriticalInEs,
    missingCriticalInEn,
    invalidValues,
    summary: hasErrors
      ? 'i18n scope validation failed.'
      : 'i18n scope validation passed for critical keys.'
  };
}

async function loadLocaleMessages(relativePath, exportName) {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const moduleUrl = pathToFileURL(absolutePath).href;
  const imported = await import(moduleUrl);
  return imported[exportName];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const reportPath = args.report || 'reports/i18n-integrity-report.json';

  const EN_MESSAGES = await loadLocaleMessages('locales/en/messages.js', 'EN_MESSAGES');
  const ES_MESSAGES = await loadLocaleMessages('locales/es/messages.js', 'ES_MESSAGES');

  const enFlatKeys = flattenMessageKeys(EN_MESSAGES);
  const esFlatKeys = flattenMessageKeys(ES_MESSAGES);

  const enCritical = filterCriticalKeys(enFlatKeys);
  const esCritical = filterCriticalKeys(esFlatKeys);

  const missingCriticalInEs = enCritical.filter((key) => !esCritical.includes(key)).sort();
  const missingCriticalInEn = esCritical.filter((key) => !enCritical.includes(key)).sort();
  const invalidValues = [
    ...collectInvalidLeafValues(EN_MESSAGES, 'en'),
    ...collectInvalidLeafValues(ES_MESSAGES, 'es')
  ];

  const report = makeReport({
    missingCriticalInEs,
    missingCriticalInEn,
    invalidValues
  });

  const outputPath = path.resolve(process.cwd(), reportPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  if (report.status === 'error') {
    console.error('i18n scope validation failed. See report:', reportPath);
    process.exit(1);
  }

  console.log(`i18n scope validation passed. Report written to ${reportPath}`);
}

main().catch((error) => {
  console.error('i18n scope validation failed with exception:', error);
  process.exit(1);
});
