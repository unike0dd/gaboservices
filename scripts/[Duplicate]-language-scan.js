#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = new Set(['.git', 'node_modules']);
const TEXT_EXT = new Set(['.js', '.mjs', '.cjs', '.json', '.html', '.xml', '.txt', '.css', '.md', '.yml', '.yaml']);

const PATTERNS = [
  { key: 'hardcoded_en_path', regex: /\/(?:en)(?:\/|\b)/g },
  { key: 'hardcoded_es_path', regex: /\/(?:es)(?:\/|\b)/g },
  { key: 'query_lang_en', regex: /\?lang=en\b/g },
  { key: 'query_lang_es', regex: /\?lang=es\b/g },
  { key: 'hreflang_en', regex: /hreflang=["']en["']/g },
  { key: 'hreflang_es', regex: /hreflang=["']es["']/g },
  { key: 'locale_array_en_es', regex: /\[(?:\s*["']en["']\s*,\s*["']es["']\s*)\]/g }
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (TEXT_EXT.has(ext) || entry.name === 'CNAME' || entry.name === '_headers') out.push(full);
  }
  return out;
}

function lineCol(text, idx) {
  const prior = text.slice(0, idx);
  const lines = prior.split('\n');
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

function getI18nDuplicateSummary(files) {
  const keyCounts = new Map();
  for (const file of files) {
    const txt = fs.readFileSync(file, 'utf8');
    const re = /data-i18n=["']([^"']+)["']/g;
    let m;
    while ((m = re.exec(txt))) {
      keyCounts.set(m[1], (keyCounts.get(m[1]) || 0) + 1);
    }
  }

  return Array.from(keyCounts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 250)
    .map(([key, count]) => ({ key, count }));
}

function main() {
  const files = walk(ROOT);
  const findings = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const txt = fs.readFileSync(file, 'utf8');

    for (const pattern of PATTERNS) {
      let m;
      pattern.regex.lastIndex = 0;
      while ((m = pattern.regex.exec(txt))) {
        const { line, col } = lineCol(txt, m.index);
        findings.push({
          file: rel,
          type: pattern.key,
          value: m[0],
          line,
          col
        });
      }
    }
  }

  const byType = findings.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const report = {
    generatedAt: new Date().toISOString(),
    totalFindings: findings.length,
    totalsByType: byType,
    duplicatedI18nKeysTop: getI18nDuplicateSummary(files),
    findings
  };

  const outDir = path.join(ROOT, 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'language-deep-scan-report.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`Wrote ${path.relative(ROOT, outFile)} with ${report.totalFindings} findings.`);
}

main();
