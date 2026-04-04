# Repository Health Audit (April 4, 2026)

## Scope
This audit reviewed runtime wiring, links/references, event triggers/actions, and function-level behaviors across the static site and chatbot integration.

## What was validated
- Entry-point wiring (`main.js`) and startup order.
- FAB + chatbot event choreography (`fab-controls.js`, `assets/mobile-nav.js`, `chatbot/embed.js`).
- Local link/reference integrity in HTML (`*.html`).
- JS syntax and i18n integrity checks from `scripts/`.

## Findings

### 1) Chatbot open action was conflicting with FAB visibility (fixed)
- `chatbot/embed.js` called `setDesktopFabOpenState(false)` inside `setOpen(open)`.
- Effect: opening chatbot could immediately close/hide its parent FAB overlay, causing "chatbot not opening" behavior depending on interaction path.
- Fix applied: removed forced FAB-close call from chatbot open/close logic; chatbot now only controls its own panel/overlay visibility.

### 2) Chatbot behavior policy and implementation are only partially aligned
- `chatbot/behavior.yml` includes runtime goals like rate-limiting, suspicious activity logging, and output filtering.
- `chatbot/embed.js` currently enforces input sanitization and length limits, but does **not** implement client-side rate limiting telemetry or output redaction rules.
- This is not necessarily a blocker if enforced server-side, but it is a policy/implementation gap.

### 3) Local link/reference integrity is healthy
- Local relative `href` and `src` references across HTML files resolve to existing files/directories (no missing local assets detected in the automated check).

### 4) Baseline quality checks are currently passing
- JS syntax validation passes.
- Locale artifact and i18n scope checks pass.

## Is the chatbot behaving as expected?
After the fix in this commit, **core open/close behavior is now aligned with expected UX**:
- Open from FAB trigger.
- Close by close controls, ESC, or outside click.
- Continue rendering/streaming replies and preserving local history.

Remaining expectation caveat:
- If current origin is not in `ORIGIN_ASSET_MAP`, chatbot intentionally reports host-unavailable.

## Prioritized plan to fix remaining issues

1. **Server/client policy parity**
   - Document which behavior.yml controls are server-enforced vs client-enforced.
   - Add explicit comments or schema fields (`enforced_by: client|server|both`) for each rule.

2. **Abuse controls**
   - Add lightweight client-side request throttling (e.g., 10 requests/min/session) and user feedback.
   - Keep authoritative rate-limits on the worker.

3. **Output safety hardening**
   - Add post-stream output guardrails for simple sensitive-token redaction patterns before render.
   - Preserve `textContent` rendering (already safe against HTML execution).

4. **Observability**
   - Emit structured analytics/debug events for chatbot lifecycle and worker failures (without sensitive payloads).

5. **Automated regression**
   - Add Playwright smoke tests for:
     - FAB open → chatbot open
     - ESC/outside close
     - blocked origin error path
     - successful stream path with mocked SSE

## Execution update (April 4, 2026)

Completed in code:
- **Step 2 (Abuse controls):** Added client-side rate limiting at 10 requests/minute/session with user feedback and telemetry events on throttle.
- **Step 3 (Output safety hardening):** Added response redaction for sensitive tokens (`password`, `api_key`, `secret`, `token`) before render/persist.
- **Step 4 (Observability):** Added structured `gabo:chatbot-telemetry` events for lifecycle and stream outcomes without including raw user content.

Explained (not yet implemented):
- **Step 1 (Server/client policy parity):** Needs a single source of truth that marks each `behavior.yml` control as enforced by `client`, `server`, or `both` to avoid drift and false assumptions.
- **Step 5 (Automated regression):** Needs test harness setup (e.g., Playwright + SSE mocking + CI job) to continuously prevent regressions in open/close/stream/error flows.
