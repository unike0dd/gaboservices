# Repo Reduction Report (2026-04-24)

## Phase 1 — Audit

### Duplicate HTML blocks
- Repeated global shell in nearly every page:
  - same `<head>` metadata stack (OG/Twitter/canonical)
  - same stylesheet loading pattern (legacy `styles.css` + `responsive.css` + `assets/mobile-nav.css`)
  - same runtime script boot (`site.config.js` + `main.js`)
- Contact and Careers pages share the same intake page shell and form workflow wiring pattern with only endpoint/id/status differences.
- Service detail pages repeat the same shell patterns and differ mainly in page content.

### Duplicate CSS blocks
- `styles.css` contained global tokens/layout plus duplicate section declarations (e.g., repeated `hero h1` + `.site-footer h4` blocks).
- `responsive.css` duplicated breakpoint logic that belongs to global runtime styling.
- `footer/footer.css` was imported by `styles.css` and can be safely inlined into one global stylesheet.
- `assets/mobile-nav.css` was loaded independently on most pages but is global in behavior and safe to merge into a single site stylesheet.

### Duplicate JS functions
- Shared form submission logic (`formToPlainObject`, `parseResponsePayload`, `getBackendErrorMessage`, `bindNumericInput`, `setSubmittingState`, `getOpsAssetId`, `honeypotTriggered`, fetch submit flow) is centralized in `assets/js/form-submit-core.js`.
- Contact/Careers scripts now only provide page-specific config + status messaging and delegate common logic to the shared runtime.

### Unused/stale files observed
- `workers/contact-careers-intake-worker.js` duplicated `workers.contact-careers-intake.js` and was not referenced by active wrangler entrypoints.
- Legacy split metadata runtime files (`site-metadata-defaults.js`, `site-metadata.js`, `site-governance.js`) were superseded by a consolidated runtime module.
- Legacy split global CSS files (`styles.css`, `responsive.css`, `footer/footer.css`, `assets/mobile-nav.css`) became stale after consolidation.

### Stale docs/scripts
- `DEEP_DIVE_FINDINGS_2026-04-23.md` documents prior worker duplication findings and remains historical documentation (kept).
- Validation scripts under `scripts/` remain relevant and were kept.

### Files safe to merge
- `styles.css` + `responsive.css` + `footer/footer.css` + `assets/mobile-nav.css` -> `assets/css/site.css`
- `site-metadata-defaults.js` + `site-metadata.js` + `site-governance.js` -> `site-runtime.js`

### Files unsafe to touch (kept intentionally)
- Contact/Careers form HTML fields + endpoint contract wiring (`/submit/contact`, `/submit/careers`)
- Honeypot field names/inputs
- Chatbot runtime and UI assets (`chatbot/embed.js`, `chatbot/chatbot.css`, `chatbot/fab.css`)
- Worker contract file `workers.contact-careers-intake.js`
- Existing URL structure and page content files under `services/`, `legal/`, `about/`, `learning/`, `contact/`, `careers/`


## Phase 2 — Completed

- Centralized shared form submit/runtime wiring in `assets/js/form-submit-core.js` via `initFormPage(...)`.
- Reduced `contact/contact-hub.js` and `careers/careers-form.js` to page-specific configuration only (form IDs, endpoint paths, honeypot names, per-page validation/messages, workflow config).
- Preserved endpoint contracts and honeypot behavior:
  - Contact: `/submit/contact`
  - Careers: `/submit/careers`


## Phase 3 — Continued

- Confirmed all pages continue loading consolidated `assets/css/site.css` as the single global stylesheet entrypoint.
- Performed safe deduplication inside `assets/css/site.css` by removing one duplicated global heading/footer declaration block that was repeated verbatim during prior consolidation.
- Kept chatbot CSS independent (`/chatbot/chatbot.css` + `/chatbot/fab.css`) via runtime loader to avoid changing chatbot embed loading behavior.


## Phase 4 — Completed

- Metadata/governance logic remains consolidated in `site-runtime.js` (defaults + merge + governance init).
- Simplified `site.config.js` to runtime overrides only (`forms` and `chatbot` origin asset maps + intake base URL), removing duplicated static SEO/name/security/media payload now owned by runtime defaults.
- Preserved existing worker and chatbot origin-map contracts without exposing new secrets.


## Phase 5 — Completed

- Normalized shared HTML shell asset loading to root-absolute paths (e.g., `/site.config.js`, `/main.js`, `/form-workflow.js`, `/assets/js/form-submit-core.js`) across route pages.
- Kept all page URLs, visible copy, class names, form field names, and endpoint paths unchanged.
- Maintained static HTML architecture (no build system introduced) while reducing path-variant boilerplate for future edits.

## Phase 6 Deletion Classification

### SAFE TO DELETE
- `styles.css`
- `responsive.css`
- `footer/footer.css`
- `assets/mobile-nav.css`
- `site-metadata-defaults.js`
- `site-metadata.js`
- `site-governance.js`
- `workers/contact-careers-intake-worker.js`

### SAFE TO MERGE
- `styles.css`, `responsive.css`, `footer/footer.css`, `assets/mobile-nav.css` (merged into `assets/css/site.css`)
- `site-metadata-defaults.js`, `site-metadata.js`, `site-governance.js` (merged into `site-runtime.js`)

### KEEP
- `site.config.js`
- `assets/js/form-submit-core.js`
- `contact/contact-hub.js`
- `careers/careers-form.js`
- `main.js`
- all route HTML pages and legal pages
- chatbot assets
- canonical worker entrypoint files

### REVIEW MANUALLY
- `DEEP_DIVE_FINDINGS_2026-04-23.md` (historical notes vs current code state)
- `wiki/` sync artifacts (not runtime-critical, but may be part of editorial workflow)
