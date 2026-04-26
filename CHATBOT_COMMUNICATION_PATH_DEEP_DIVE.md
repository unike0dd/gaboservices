# Chatbot Communication Path Deep Dive (Read-only Audit)

## Scope and guardrails
- **Goal:** map chatbot communication paths, and explicitly separate contact/careers submission paths from chatbot paths.
- **Guardrail respected:** no chatbot communication implementation files were modified.

## 1) Chatbot communication path (authoritative list)

### 1.1 Frontend entrypoint and bootstrap
1. `main.js` imports and initializes chatbot embed runtime.
2. `chatbot/embed.js` reads `window.SITE_METADATA.workers.chatbotBaseUrl` and builds:
   - `WORKER_BASE = <chatbotBaseUrl>`
   - `WORKER_CHAT = ${WORKER_BASE}/api/chat`

### 1.2 Chatbot network route
- **Primary outbound route:** `POST /api/chat` on the chatbot worker base URL (`chatbotBaseUrl`).
- **Request headers used by chatbot runtime:**
  - `Content-Type: application/json`
  - `Accept: text/event-stream`
  - `x-gabo-parent-origin: <window.location.origin>`
  - `x-ops-asset-id: <origin-mapped chatbot asset id>`
- **Request body shape (chatbot):**
  - `mode: "iframe_service_qa"`
  - `messages: [{ role: 'user', content: <sanitized text> }]`
  - `meta: { surface: 'gabo_io_global_widget', communication: 'Cyber Security' }`
- **Response mode:** streaming SSE (`text/event-stream`) parsed chunk-by-chunk.

### 1.3 Chatbot trust and allowlist path
- Asset trust mapping is sourced from `window.SITE_METADATA.chatbot.originAssetMap`.
- On missing allowlisted origin/asset id, chatbot refuses request with host-not-allowlisted error path.

### 1.4 Chatbot local communication channels (browser-side)
- **Custom window events consumed/emitted:**
  - `gabo:chatbot-open`
  - `gabo:chatbot-close`
  - `gabo:chatbot-telemetry`
  - `gabo:fab-open`
  - `gabo:fab-close`
- **Mobile trigger selector bridge:** `[data-mobile-chatbot-trigger]`.

### 1.5 Chatbot local persistence/rate control paths
- `localStorage` keys:
  - `gabo_io_chatbot_cache_v1` (open state + message history)
  - `gabo_io_chatbot_rate_v1` (rate-limit timestamps)
- Request throttling:
  - max `10` sends per `60s` sliding window.

---

## 2) Contact and careers paths (separate from chatbot)

### 2.1 Public browser submission routes
- **Contact path:** `POST /v1/intake/contact`
- **Careers path:** `POST /v1/intake/careers`
- These are configured by page-specific scripts:
  - `contact/contact-hub.js` -> `submitPath: '/v1/intake/contact'`
  - `careers/careers-form.js` -> `submitPath: '/v1/intake/careers'`

### 2.2 Intake worker path (public edge)
- `workers/solitary-term-worker.js` accepts only:
  - `/v1/intake/contact`
  - `/v1/intake/careers`
- This worker validates origin + asset identity and relays internally via service binding.

### 2.3 Internal delivery worker path (private hop)
- `workers.contact-careers-intake.js` routes only:
  - `/contact`
  - `/careers`
- It receives bridge traffic (shared secret) and forwards to Apps Script bridge.

---

## 3) Explicit separation matrix

| Domain | Purpose | Public Route(s) | Config Source | Worker Base |
|---|---|---|---|---|
| Chatbot | conversational SSE streaming | `/api/chat` | `SITE_METADATA.workers.chatbotBaseUrl` + `SITE_METADATA.chatbot.originAssetMap` | `drastic-measures...workers.dev` |
| Contact Intake | contact form submission | `/v1/intake/contact` | `SITE_METADATA.forms.contactIntakeBaseUrl` + forms asset map | `solitary-term-4203...workers.dev` |
| Careers Intake | careers form submission | `/v1/intake/careers` | `SITE_METADATA.forms.careersIntakeBaseUrl` + forms asset map | `solitary-term-4203...workers.dev` |

**Conclusion:** chatbot communication path is already logically and operationally separate from contact/careers submission paths (different base URLs, different route contracts, different config namespaces, different runtime payload intent).

---

## 4) All chatbot communication paths (quick checklist)
- UI open/close triggers: FAB button + mobile trigger + custom events.
- Browser event bus: `gabo:chatbot-open`, `gabo:chatbot-close`, `gabo:chatbot-telemetry`, `gabo:fab-open`, `gabo:fab-close`.
- Network egress: `POST ${chatbotBaseUrl}/api/chat` with SSE response.
- Identity headers: `x-gabo-parent-origin`, `x-ops-asset-id`.
- Trust map lookup: `SITE_METADATA.chatbot.originAssetMap`.
- Local state path: `localStorage[gabo_io_chatbot_cache_v1]`.
- Local rate control path: `localStorage[gabo_io_chatbot_rate_v1]`.

---

## 5) Separate repo-to-Cloudflare mapping for Contact and Careers (solitary-term-4203)

### 5.1 Contact communication mapping

| Hop | Source in repo | Contract | Destination |
|---|---|---|---|
| 1 | `contact/contact-hub.js` | sets `submitPath: '/v1/intake/contact'` and `submitBaseUrlKey: 'contactIntakeBaseUrl'` | Browser submit target builder in `assets/js/form-submit-core.js` |
| 2 | `assets/js/form-submit-core.js` | builds `submitEndpoint = <forms.contactIntakeBaseUrl>/v1/intake/contact` and sends `POST` JSON with `x-ops-asset-id` + `x-gabo-parent-origin` | CF Worker **solitary-term-4203** (`workers/solitary-term-worker.js`) |
| 3 | `workers/solitary-term-worker.js` | validates origin + asset + payload, resolves route key `contact`, and relays with service binding `DELIVERY` to internal path `/contact` using shared secret header `x-solitary-bridge-secret` | Internal worker target defined by `wrangler` binding |
| 4 | `workers.contact-careers-intake.js` | receives `/contact`, validates bridge secret, forwards to Apps Script bridge with `x-solitary-route: contact` | `APPS_SCRIPT_BRIDGE_URL` |

### 5.2 Careers communication mapping

| Hop | Source in repo | Contract | Destination |
|---|---|---|---|
| 1 | `careers/careers-form.js` | sets `submitPath: '/v1/intake/careers'` and `submitBaseUrlKey: 'careersIntakeBaseUrl'` | Browser submit target builder in `assets/js/form-submit-core.js` |
| 2 | `assets/js/form-submit-core.js` | builds `submitEndpoint = <forms.careersIntakeBaseUrl>/v1/intake/careers` and sends `POST` JSON with `x-ops-asset-id` + `x-gabo-parent-origin` | CF Worker **solitary-term-4203** (`workers/solitary-term-worker.js`) |
| 3 | `workers/solitary-term-worker.js` | validates origin + asset + payload, resolves route key `careers`, and relays with service binding `DELIVERY` to internal path `/careers` using shared secret header `x-solitary-bridge-secret` | Internal worker target defined by `wrangler` binding |
| 4 | `workers.contact-careers-intake.js` | receives `/careers`, validates bridge secret, forwards to Apps Script bridge with `x-solitary-route: careers` | `APPS_SCRIPT_BRIDGE_URL` |

### 5.3 Hard boundary confirmation
- Contact/Careers browser traffic goes to `solitary-term-4203` using **dedicated v1 intake routes**: `/v1/intake/contact` and `/v1/intake/careers`.
- Chatbot traffic goes to the separate chatbot worker base using `/api/chat`.
- No contact/careers form path in this repo posts to `/api/chat`, and chatbot path does not post to intake routes.
- Worker compatibility note: `workers/solitary-term-worker.js` still accepts legacy `/submit/contact` and `/submit/careers` routes for backward compatibility, but repo forms now use the dedicated v1 intake paths.

---

## 6) Direct answer: did anything change in chatbot path/communication?
- **No runtime chatbot path or communication contract was changed.**
- This update changes contact/careers intake routes and worker path mapping only.
- No edits were made to chatbot runtime files such as `chatbot/embed.js`, `chatbot/chatbot.css`, `chatbot/fab.css`, or `chatbot/behavior.yml`.
