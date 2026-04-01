#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const requiredFiles = [
  'locales/en/messages.js',
  'locales/es/messages.js'
];

const missing = requiredFiles.filter((relativePath) => {
  const fullPath = path.resolve(process.cwd(), relativePath);
  return !fs.existsSync(fullPath);
});

if (missing.length > 0) {
  console.error('Locale artifact check failed. Missing files:');
  missing.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log('Locale artifact check passed.');
