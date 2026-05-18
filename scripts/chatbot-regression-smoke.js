#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const embed = fs.readFileSync(path.join(process.cwd(), 'chatbot', 'embed.js'), 'utf8');
const css = fs.readFileSync(path.join(process.cwd(), 'chatbot', 'chatbot.css'), 'utf8');

const checks = [
  {
    name: 'GABO IO uses same-origin API route',
    test: () => /const API_URL = '\/api\/ops-online-chat';/.test(embed)
  },
  {
    name: 'GABO IO does not expose workers.dev URLs',
    test: () => !/workers\.dev/.test(embed)
  },
  {
    name: 'GABO IO renders the required chatbot structure',
    test: () => /id="chatbot-container"/.test(embed) && /id="chat-log"/.test(embed) && /id="chatbot-input-row"/.test(embed)
  },
  {
    name: 'GABO IO caps user input at 256 characters',
    test: () => /maxlength="256"/.test(embed)
  },
  {
    name: 'GABO IO CSS contains supplied primary chatbot selectors',
    test: () => /#chatbot-container/.test(css) && /#chatbot-header/.test(css) && /\.chat-msg/.test(css)
  }
];

const failures = checks.filter((check) => !check.test());

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL: ${failure.name}`));
  process.exit(1);
}

checks.forEach((check) => console.log(`PASS: ${check.name}`));
