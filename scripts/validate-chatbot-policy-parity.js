#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const behavior = fs.readFileSync(path.join(process.cwd(), 'chatbot', 'behavior.yml'), 'utf8');
const embed = fs.readFileSync(path.join(process.cwd(), 'chatbot', 'embed.js'), 'utf8');

const requiredPairs = [
  ['api_path: /api/ops-online-chat', "const API_URL = '/api/ops-online-chat';"],
  ['max_message_length: 256', 'maxlength="256"'],
  ['same_origin_api: true', "const API_URL = '/api/ops-online-chat';"],
  ['expose_workers_dev_url: false', 'workers.dev']
];

const failures = [];

for (const [policyNeedle, runtimeNeedle] of requiredPairs) {
  if (!behavior.includes(policyNeedle)) {
    failures.push(`Missing behavior policy: ${policyNeedle}`);
    continue;
  }

  if (runtimeNeedle === 'workers.dev') {
    if (embed.includes(runtimeNeedle)) {
      failures.push('Runtime exposes a workers.dev URL despite policy forbidding it.');
    }
    continue;
  }

  if (!embed.includes(runtimeNeedle)) {
    failures.push(`Missing runtime parity marker: ${runtimeNeedle}`);
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error(failure));
  process.exit(1);
}

console.log('Chatbot policy parity validation passed.');
