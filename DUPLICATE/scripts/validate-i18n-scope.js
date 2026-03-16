#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parseLanguageCodes } = require('./lib/locale-page-builder');
const { SOURCE_ROUTES } = require('./lib/locale-route-map');

const ROOT = path.resolve(__dirname, '..', '..');
const I18N_ROOT = path.join(ROOT, 'DUPLICATE');
const SCOPE_FILE = path.join(I18N_ROOT, 'i18n-translation-scope.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function parseArgs(argv) {
  const args = { report: '' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--report') {
      args.report = argv[i + 1] || '';
      i += 1;
    }
  }
  return args;
}

function extractI18nKeys(content) {
  const keys = new Set();
  const regex = /data-i18n(?:-(?:aria-label|placeholder|title|content))?=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content))) {
    keys.add(match[1]);
  }
  return keys;
}

function usedI18nKeys() {
  const files = new Set(SOURCE_ROUTES.map((entry) => path.join(ROOT, entry.source)));
  files.add(path.join(ROOT, 'main.js'));
  files.add(path.join(ROOT, 'chatbot/chatbot-controls.js'));
  files.add(path.join(I18N_ROOT, 'assets/legal-i18n.js'));

  const used = new Set();
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const key of extractI18nKeys(content)) used.add(key);
  }
  return used;
}

function listMissing(keys, dictionary) {
  return keys.filter((key) => {
    const value = dictionary?.[key];
    return typeof value !== 'string' || value.trim().length === 0;
  });
}

function writeReport(reportPath, data) {
  if (!reportPath) return;
  const absolute = path.isAbsolute(reportPath) ? reportPath : path.join(ROOT, reportPath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`[i18n-scope] Wrote report: ${path.relative(ROOT, absolute)}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const scope = readJson(SCOPE_FILE);
  const criticalKeys = Array.from(new Set(scope.criticalKeys || [])).sort();
  const { DICTIONARY } = parseLanguageCodes();
  const en = DICTIONARY.en || {};
  const es = DICTIONARY.es || {};

  const missingCriticalInEn = listMissing(criticalKeys, en);
  const missingCriticalInEs = listMissing(criticalKeys, es);

  const allKeys = Array.from(new Set([...Object.keys(en), ...Object.keys(es)])).sort();
  const optionalKeys = allKeys.filter((key) => !criticalKeys.includes(key));
  const optionalMissingInEs = listMissing(optionalKeys, es);
  const optionalMissingInEn = listMissing(optionalKeys, en);

  const usedKeys = usedI18nKeys();
  const criticalUsed = criticalKeys.filter((key) => usedKeys.has(key));
  const criticalUnused = criticalKeys.filter((key) => !usedKeys.has(key));
  const deadKeys = allKeys.filter((key) => !usedKeys.has(key));

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      dictionaryUnion: allKeys.length,
      critical: criticalKeys.length,
      optional: optionalKeys.length,
      usedByDataI18n: usedKeys.size,
      deadKeys: deadKeys.length
    },
    critical: {
      missingInEn: missingCriticalInEn,
      missingInEs: missingCriticalInEs,
      used: criticalUsed,
      unused: criticalUnused
    },
    optional: {
      missingInEn: optionalMissingInEn,
      missingInEs: optionalMissingInEs
    },
    deadKeys
  };

  console.log(`[i18n-scope] Total dictionary keys (union): ${allKeys.length}`);
  console.log(`[i18n-scope] Critical keys: ${criticalKeys.length}`);
  console.log(`[i18n-scope] Optional keys: ${optionalKeys.length}`);
  console.log(`[i18n-scope] Keys referenced via data-i18n*: ${usedKeys.size}`);
  console.log(`[i18n-scope] Dead dictionary keys (not referenced): ${deadKeys.length}`);

  if (criticalUnused.length) {
    console.log(`[i18n-scope] Critical keys not currently referenced (${criticalUnused.length}):`);
    criticalUnused.forEach((key) => console.log(`  - ${key}`));
  }

  if (optionalMissingInEn.length || optionalMissingInEs.length) {
    console.log(`[i18n-scope] Optional key parity gaps: missing in en=${optionalMissingInEn.length}, missing in es=${optionalMissingInEs.length}`);
  }

  writeReport(args.report, report);

  if (missingCriticalInEn.length || missingCriticalInEs.length) {
    console.error('[i18n-scope] Critical translation coverage check failed.');
    if (missingCriticalInEn.length) {
      console.error('  Missing critical keys in en:');
      missingCriticalInEn.forEach((key) => console.error(`    - ${key}`));
    }
    if (missingCriticalInEs.length) {
      console.error('  Missing critical keys in es:');
      missingCriticalInEs.forEach((key) => console.error(`    - ${key}`));
    }
    process.exit(1);
  }

  console.log(`[i18n-scope] Validation passed. Checked ${criticalKeys.length} critical key(s).`);
}

main();
