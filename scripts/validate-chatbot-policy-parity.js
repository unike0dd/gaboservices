#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'chatbot', 'behavior.yml');
const text = fs.readFileSync(file, 'utf8');

const actionLines = [...text.matchAll(/^[ \t-]*action:\s*([A-Za-z0-9_]+)/gm)];
if (!actionLines.length) {
  console.error('No action definitions found in chatbot/behavior.yml');
  process.exit(1);
}

const missing = [];
for (const match of actionLines) {
  const action = match[1];
  const start = match.index + match[0].length;
  const nextActionIndex = text.slice(start).search(/^[ \t-]*action:\s*/m);
  const block = nextActionIndex === -1 ? text.slice(start) : text.slice(start, start + nextActionIndex);
  if (!/enforced_by:\s*(client|server|cloudflare|both)/.test(block)) {
    missing.push(action);
  }
}

if (!/interaction:[\s\S]*?enforced_by:\s*(client|server|cloudflare|both)/m.test(text)) {
  missing.push('interaction');
}
if (!/monitoring:[\s\S]*?enforced_by:\s*(client|server|cloudflare|both)/m.test(text)) {
  missing.push('monitoring');
}
if (!/maintenance:[\s\S]*?enforced_by:\s*(client|server|cloudflare|both)/m.test(text)) {
  missing.push('maintenance');
}

if (missing.length) {
  console.error(`Policy parity check failed. Missing enforced_by on: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Policy parity check passed for ${actionLines.length} actions + lifecycle sections.`);
