# Script Runtime Alignment Matrix

This document links each JavaScript file to its runtime entrypoint, trigger/event, and action so script behavior is explicit and traceable.

## Frontend runtime scripts

| Script | Where linked/referenced | Trigger/event | Primary action/function |
|---|---|---|---|
| `human-verification-gate.js` | `index.html` | `DOMContentLoaded` | Creates Turnstile + honeypot overlay, blocks page until verification or timeout. |
| `main.js` (module) | All main public pages | Module evaluation + DOM event listeners | Boots i18n UI, nav/actions, service cards, forms, chatbot embed hooks, page interactions. |
| `page-style-switcher.js` | All main public pages | Button click events | Toggles the editorial/news-cut style mode and persists preference. |
| `site.config.js` | All main public pages | Script load (global assignment) | Defines `window.SITE_METADATA` consumed by runtime modules. |
| `adaptive-layout.js` | Imported by `main.js` | Function call from `main.js` | Initializes adaptive layout logic and responsive behavior hooks. |
| `language-codes.js` | Imported by `main.js` | Module import resolution | Supplies dictionaries/config for i18n, plans, and services metadata. |

## Legal pages scripts

| Script | Where linked/referenced | Trigger/event | Primary action/function |
|---|---|---|---|
| `assets/legal-i18n.js` | `legal/*.html` | DOM ready / initialization in script | Applies legal-page language switch and localized labels/content. |
| `assets/cookie-consent.js` | `legal/cookies.html` | Script init + user interactions | Applies cookie-consent page behavior and controls. |

## Chatbot and worker scripts

| Script | Where linked/referenced | Trigger/event | Primary action/function |
|---|---|---|---|
| `chatbot/chatbot-worker-stream.js` | Imported by chatbot controls/runtime | Function calls during chatbot boot | Resolves gateway/embed URLs and opens direct SSE chat stream. |
| `chatbot/chatbot-controls.js` | Imported by `main.js` runtime path | UI/chatbot init lifecycle | Handles chatbot UI state and stream interactions. |
| `chatbot/worker_files/con-artist.gateway.js` | Cloudflare Worker deployment source | HTTP route handlers (`/api/chat`, `/embed`, health, repo handshake) | Enforces origin/asset identity checks and forwards upstream stream traffic. |

## Known intentionally non-linked script asset

| Script | Status |
|---|---|
| `fab-controls.js` | Present in repo, not currently linked by any page/module. Keep as staging asset or remove if no longer needed. |

## Alignment implemented in this update

- Added `site.config.js` inclusion to all service detail pages so `main.js` receives the same config context as the rest of the site pages.
- Kept the Turnstile gate active and linked on homepage (`index.html` + `human-verification-gate.js` + `human-verification-gate.css`).
