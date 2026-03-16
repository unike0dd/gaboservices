# Repository Diagnostic Report (Refresh)

Date: 2026-03-16 (rerun)
Scope: full static audit of HTML, JS modules, routing artifacts, and deploy headers.

## Audit Method (what was re-checked)
- JavaScript syntax validation across all `*.js` modules.
- Cross-file reference scans for exported/unused symbols.
- Internal link resolution checks (relative + absolute + locale variants).
- Security/config review of `_headers` vs page-level script requirements.
- i18n/a11y SEO spot checks (`hreflang`, dictionary coverage).

---

## 1) Errors / High-Risk Disconnects

### 1.1 CSP policy mismatch: Turnstile is allowed by pages but blocked by global headers
**Category:** Security + runtime wiring (High)

**What was found**
- `contact` and `careers` load Turnstile from `https://challenges.cloudflare.com`.
- Global `_headers` CSP does **not** allow that origin in `script-src`, `script-src-elem`, `connect-src`, or `frame-src`.
- If deployed headers are enforced, Turnstile can fail even though page-level CSP meta tags permit it.

**Evidence**
- `_headers` global CSP policy.
- Turnstile script includes in `contact/index.html` and `careers/index.html`.

**Impact**
- Human-verification flow may fail on production, breaking protected form submission paths.

**Recommendation**
- Align `_headers` policy with runtime needs (add `https://challenges.cloudflare.com` to the relevant directives) or split CSP by route.

---

### 1.2 Locale path generation is active while locale routing layer is intentionally disabled
**Category:** Routing/i18n contract (High)

**What was found**
- `main.js` builds `/es/...` URLs via `buildLocalizedPath()` and rewrites internal links accordingly.
- `legacy-locale-redirects.txt` explicitly states locale redirects are disabled.
- No active `_redirects` rules were found in repo for `/es/*` mapping.

**Impact**
- Locale deep links can 404 depending on host rewrite behavior, causing inconsistent i18n navigation.

**Recommendation**
- Either (A) add host-level rewrites for `/es/*`, or (B) stop emitting `/es/...` URLs and keep locale state query/cookie-based.

---

## 2) Logic Bugs / Wiring Quality

### 2.1 `resolveWorkerTargets` ignores caller override for `parentOrigin`
**Category:** Functional bug (Medium)

**What was found**
- Function accepts `parentOrigin`, but sets `parent` from `window.location.origin` first.
- This prevents proper override for embed/test contexts.

**Recommendation**
- Invert fallback order: prefer explicit `parentOrigin`, then fallback to `window.location.origin`.

---

### 2.2 Multiple overlapping link-localization passes increase mutation churn
**Category:** Maintainability / future defect risk (Medium)

**What was found**
- Link rewriting occurs in multiple flows (`syncServiceCardLinks`, `syncLanguageAwareLinks`, `syncInternalLanguageLinks`).
- These functions can touch overlapping anchors at startup and during language transitions.

**Impact**
- Harder reasoning/debugging for navigation bugs; greater risk of regressions when changing one pass.

**Recommendation**
- Consolidate to one canonical link-localization pipeline and scope special cases explicitly.

---

## 3) Unwired / Dead Code Candidates

### 3.1 `openDirectWorkerStream` export has no in-repo consumers
**Category:** Unwired function (Low)

**What was found**
- Export exists in `chatbot/chatbot-worker-stream.js`.
- No import/use detected elsewhere in repository.

**Recommendation**
- Remove it if obsolete, or wire it into chatbot transport and add a focused test.

---

### 3.2 `IS_LOCALE_ROUTE` constant declared but not used
**Category:** Dead code (Low)

**What was found**
- `IS_LOCALE_ROUTE` is declared in `main.js` and never referenced.

**Recommendation**
- Remove unused constant or use it for route-conditional locale logic.

---

## 4) Governance / SEO / Consistency Gaps

### 4.1 `hreflang` alternates are inconsistent across pages
**Category:** SEO/i18n governance (Medium)

**What was found**
- `legal/*` pages and `learning/index.html` lack `rel="alternate" hreflang="..."` links, while other pages include locale alternates.

**Impact**
- Search engines receive inconsistent locale signals; language-switch navigation heuristics are less predictable.

**Recommendation**
- Add `hreflang` alternate links consistently for all localized pages.

---

### 4.2 CSP strategy is split across global header + per-page meta with static hash lists
**Category:** Security governance (Medium)

**What was found**
- Policy is maintained in two layers (`_headers` + per-page meta CSP).
- Hash-heavy page meta policies can drift and become stale.

**Impact**
- Harder policy operations and higher chance of accidental script blocking.

**Recommendation**
- Choose one primary CSP source-of-truth where possible, and automate policy validation in CI.

---

## 5) Re-check Results (to close prior uncertainty)

### 5.1 Internal link integrity
- Fresh resolver-based audit found **0 broken internal links** in current repo state.
- This supersedes prior noisy output from simpler link checks.

### 5.2 i18n key coverage
- No missing non-legal translation keys detected for `data-i18n*` usages against main dictionary.

---

## Prioritized Remediation Queue
1. **P1** – Fix CSP/header mismatch for Turnstile + challenge iframe/connect.
2. **P1** – Decide and enforce locale-routing contract for `/es/*` URLs.
3. **P2** – Fix `parentOrigin` fallback order in worker target resolver.
4. **P2** – Consolidate link localization to one pass.
5. **P3** – Remove or wire dead/unwired exports/constants.
6. **P3** – Normalize `hreflang` and CSP governance patterns.
