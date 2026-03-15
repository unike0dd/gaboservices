#!/usr/bin/env node
/**
 * Standalone duplicate/language scanner.
 *
 * This script is intentionally disconnected from repo workflows:
 * - No imports from project modules.
 * - No automatic writes to tracked files.
 * - Outputs JSON to stdout unless --out <path> is provided.
 */
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

function parseArgs(argv) {
  const args = { out: '' };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--out' && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

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

function scanRepo(rootDir) {
  const files = walk(rootDir);
  const findings = [];

  for (const file of files) {
    const rel = path.relative(rootDir, file).replace(/\\/g, '/');
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

  const totalsByType = findings.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    totalFindings: findings.length,
    totalsByType,
    duplicatedI18nKeysTop: getI18nDuplicateSummary(files),
    findings
  };
}

function main() {
  const { out } = parseArgs(process.argv);
  const report = scanRepo(ROOT);
  const json = JSON.stringify(report, null, 2);

  if (out) {
    const outPath = path.resolve(ROOT, out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${json}\n`, 'utf8');
    console.log(`Wrote ${path.relative(ROOT, outPath)} with ${report.totalFindings} findings.`);
    return;
  }

  process.stdout.write(`${json}\n`);
}

main();
