#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const I18N_ROOT = path.join(ROOT, 'DUPLICATE');
const outputFile = path.join(I18N_ROOT, 'legacy-locale-redirects.txt');

const lines = [
  '# Legacy locale redirects are disabled.',
  '# Locale archive is intentionally disconnected.'
];

fs.writeFileSync(outputFile, `${lines.join('\n')}\n`, 'utf8');
console.log(`Updated ${path.relative(ROOT, outputFile)} with disconnected locale notice.`);
