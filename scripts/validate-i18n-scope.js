#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_SCOPE_FILE = path.join(ROOT, 'i18n-translation-scope.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const args = { reportPath: null, scopePath: DEFAULT_SCOPE_FILE };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--report') {
      args.reportPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === '--scope') {
      args.scopePath = path.resolve(argv[i + 1]);
      i += 1;
      continue;
    }
  }

  return args;
}

function resolveRepoPath(relativeFile) {
  return path.resolve(ROOT, relativeFile);
}

function validateScope(scope) {
  const violations = [];
  const warnings = [];

  const rules = Array.isArray(scope.rules) ? scope.rules : [];

  for (const rule of rules) {
    const file = rule.file;
    const phrases = Array.isArray(rule.forbiddenPhrases) ? rule.forbiddenPhrases : [];

    if (!file) {
      warnings.push('Encountered a rule without a file path.');
      continue;
    }

    const absoluteFile = resolveRepoPath(file);
    if (!fs.existsSync(absoluteFile)) {
      violations.push({
        file,
        phrase: null,
        message: 'Configured file is missing.'
      });
      continue;
    }

    const contents = fs.readFileSync(absoluteFile, 'utf8');

    for (const phrase of phrases) {
      if (!phrase) {
        continue;
      }

      if (contents.includes(phrase)) {
        violations.push({
          file,
          phrase,
          message: 'Forbidden phrase found in scoped file.'
        });
      }
    }
  }

  return { violations, warnings, rulesChecked: rules.length };
}

function writeReport(filePath, payload) {
  const absolutePath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function main() {
  const { reportPath, scopePath } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(scopePath)) {
    throw new Error(`Missing scope file: ${scopePath}`);
  }

  const scope = readJson(scopePath);
  const startedAt = new Date().toISOString();
  const results = validateScope(scope);

  const payload = {
    startedAt,
    finishedAt: new Date().toISOString(),
    scopeFile: path.relative(ROOT, scopePath).replace(/\\/g, '/'),
    rulesChecked: results.rulesChecked,
    warnings: results.warnings,
    violations: results.violations,
    passed: results.violations.length === 0
  };

  if (reportPath) {
    writeReport(reportPath, payload);
  }

  if (!payload.passed) {
    console.error('i18n scope validation failed.');
    for (const violation of payload.violations) {
      const phrasePart = violation.phrase ? ` phrase="${violation.phrase}"` : '';
      console.error(`- ${violation.file}:${phrasePart} ${violation.message}`);
    }
    process.exit(1);
  }

  console.log(`i18n scope validation passed (${payload.rulesChecked} rule(s) checked).`);
}

main();
