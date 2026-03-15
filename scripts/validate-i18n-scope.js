#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parseLanguageCodes } = require('./lib/locale-page-builder');
const { SOURCE_ROUTES } = require('./lib/locale-route-map');

const ROOT = path.resolve(__dirname, '..');
const SCOPE_FILE = path.join(ROOT, 'i18n-translation-scope.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
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

function main() {
  const scope = readJson(SCOPE_FILE);
  const criticalKeys = Array.from(new Set(scope.criticalKeys || []));
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

  console.log(`[i18n-scope] Total dictionary keys (union): ${allKeys.length}`);
  console.log(`[i18n-scope] Critical keys: ${criticalKeys.length}`);
  console.log(`[i18n-scope] Optional keys: ${optionalKeys.length}`);
  console.log(`[i18n-scope] Critical keys referenced in markup/templates: ${criticalUsed.length}`);

  if (criticalUnused.length) {
    console.log(`[i18n-scope] Critical keys not currently referenced (${criticalUnused.length}):`);
    criticalUnused.forEach((key) => console.log(`  - ${key}`));
  }

  if (optionalMissingInEn.length || optionalMissingInEs.length) {
    console.log(`[i18n-scope] Optional key parity gaps: missing in en=${optionalMissingInEn.length}, missing in es=${optionalMissingInEs.length}`);
    if (optionalMissingInEn.length) {
      console.log('  Optional keys missing in en:');
      optionalMissingInEn.forEach((key) => console.log(`    - ${key}`));
    }
    if (optionalMissingInEs.length) {
      console.log('  Optional keys missing in es:');
      optionalMissingInEs.forEach((key) => console.log(`    - ${key}`));
    }
  }

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

  console.log('[i18n-scope] Critical translation coverage passed for en/es.');
}

main();
