#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'chatbot', 'embed.js');
const text = fs.readFileSync(file, 'utf8');

const checks = [
  {
    name: 'FAB is not force-closed from chatbot setOpen()',
    test: () => !/function\s+setOpen\([\s\S]*?setDesktopFabOpenState\(false\)/m.test(text)
  },
  {
    name: 'Telemetry event channel exists',
    test: () => /gabo:chatbot-telemetry/.test(text)
  },
  {
    name: 'Client-side rate limiting constants exist',
    test: () => /RATE_LIMIT_MAX_REQUESTS\s*=\s*10/.test(text) && /RATE_LIMIT_WINDOW_MS\s*=\s*60\s*\*\s*1000/.test(text)
  },
  {
    name: 'Submit flow enforces rate limit',
    test: () => /const rate = consumeRateToken\(\)/.test(text) && /if \(!rate\.allowed\)/.test(text)
  },
  {
    name: 'Output redaction function exists and is applied',
    test: () => /function\s+sanitizeAssistantOutput\(/.test(text) && /sanitizeAssistantOutput\(delta\)/.test(text)
  },
  {
    name: 'SSE streaming path still present',
    test: () => /resp\.body\.getReader\(\)/.test(text) && /parseSSEBlock\(/.test(text)
  },
  {
    name: 'Close interactions preserved (ESC and outside click)',
    test: () => /event\.key === 'Escape'/.test(text) && /outside-chat-panel/.test(text)
  }
];

const failures = checks.filter((c) => !c.test());
if (failures.length) {
  console.error('Chatbot regression smoke failed:');
  failures.forEach((f) => console.error(` - ${f.name}`));
  process.exit(1);
}

console.log(`Chatbot regression smoke passed (${checks.length} checks).`);
