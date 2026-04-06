#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'chatbot', 'embed.js');
const text = fs.readFileSync(file, 'utf8');
const fabControlsFile = path.join(process.cwd(), 'fab-controls.js');
const fabControlsText = fs.readFileSync(fabControlsFile, 'utf8');
const chatbotCssFile = path.join(process.cwd(), 'chatbot', 'chatbot.css');
const chatbotCssText = fs.readFileSync(chatbotCssFile, 'utf8');
const fabCssFile = path.join(process.cwd(), 'chatbot', 'fab.css');
const fabCssText = fs.readFileSync(fabCssFile, 'utf8');

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
  },
  {
    name: 'Chat mount is not hard-hidden in FAB markup',
    test: () => !/<div id="fabChatMount"[^>]*\shidden\b/.test(fabControlsText)
  },
  {
    name: 'Chat panel and overlay are hidden by default CSS state',
    test: () =>
      /\.gabo-chatbot__panel\s*\{[\s\S]*?display:\s*none;/.test(chatbotCssText) &&
      /\.gabo-chatbot__panel:not\(\[hidden\]\)\s*\{[\s\S]*?display:\s*grid;/.test(chatbotCssText) &&
      /\.gabo-chatbot__overlay\s*\{[\s\S]*?display:\s*none;/.test(chatbotCssText) &&
      /\.gabo-chatbot__overlay:not\(\[hidden\]\)\s*\{[\s\S]*?display:\s*block;/.test(chatbotCssText)
  },
  {
    name: 'FAB marks chatbot trigger as bound to avoid duplicate click wiring',
    test: () => /fabToggle\.dataset\.chatbotBound\s*=\s*'true'/.test(fabControlsText)
  },
  {
    name: 'Outside-click close ignores interactions inside chat surface',
    test: () =>
      /function\s+isChatInteractionTarget\(event\)/.test(text) &&
      /event\.composedPath/.test(text) &&
      /if \(isChatInteractionTarget\(event\)\) return;/.test(text)
  },
  {
    name: 'FAB sits above mobile nav with 7px lift',
    test: () =>
      /body\.has-mobile-nav\s+\.fab-wrapper\s*\{[\s\S]*?bottom:\s*calc\(var\(--mobile-nav-height,\s*60px\)\s*\+\s*var\(--mobile-safe-bottom,\s*env\(safe-area-inset-bottom,\s*0px\)\)\s*\+\s*7px\);/m.test(fabCssText)
  }
];

const failures = checks.filter((c) => !c.test());
if (failures.length) {
  console.error('Chatbot regression smoke failed:');
  failures.forEach((f) => console.error(` - ${f.name}`));
  process.exit(1);
}

console.log(`Chatbot regression smoke passed (${checks.length} checks).`);
