# Script Runtime Alignment Matrix

This document links each JavaScript file to its runtime entrypoint, trigger/event, and action so script behavior is explicit and traceable.

## Frontend runtime scripts

| Script | Where linked/referenced | Trigger/event | Primary action/function |
|---|---|---|---|
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

## Shared UI support scripts

| Script | Where linked/referenced | Trigger/event | Primary action/function |
|---|---|---|---|
| `fab-controls.js` | Imported by `main.js` and `chatbot/chatbot-controls.js` | Initialization calls during app/chatbot boot | Injects and controls the floating action button (FAB) quick-actions menu and syncs quick links. |

## Alignment implemented in this update

- Added `site.config.js` inclusion to all service detail pages so `main.js` receives the same config context as the rest of the site pages.
- Moved Turnstile checks to submit-time on interactive forms (`contact` and `careers`) to reduce landing-page friction.
