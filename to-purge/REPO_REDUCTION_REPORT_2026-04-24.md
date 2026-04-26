# Repo Reduction Report — 2026-04-24

## Scope and constraints
- Preserve visual design, layout, behavior, URLs, copy, forms, chatbot behavior, mobile nav behavior, and worker contracts.
- Preserve `/submit/contact` and `/submit/careers` endpoints.
- Preserve honeypot fields.

## Duplicate HTML shell blocks
Shared head/header/footer/script boilerplate appears across:
- `about/index.html`
- `services/index.html`
- `services/*/index.html`
- `contact/index.html`
- `careers/index.html`
- `learning/index.html`

Common repeated blocks:
- SEO meta tags and social tags patterns.
- Shared stylesheet trio and shared script bootstrapping.
- Header/navigation + footer shell structure.

## Duplicate CSS blocks
- Global styles were split across `styles.css`, `responsive.css`, `footer/footer.css`, and `assets/mobile-nav.css`.
- `styles.css` also duplicated select blocks internally (`.hero h1` and `.site-footer h4` selectors repeated).

## Duplicate JS functions
`contact/contact-hub.js` and `careers/careers-form.js` duplicated:
- `formToPlainObject`
- `parseResponsePayload`
- `getBackendErrorMessage`
- `bindNumericInput`
- `setSubmittingState`
- `getOpsAssetId`
- `honeypotTriggered`
- POST submit/fetch workflow

## Unused/stale support files (review)
Potentially stale/non-runtime files identified:
- `DEEP_DIVE_FINDINGS_2026-04-23.md` (internal analysis notes).
- `scripts/chatbot-regression-smoke.js` (no in-repo invocation references).
- `scripts/validate-chatbot-policy-parity.js` (no in-repo invocation references).
- `wrangler.contact-careers-intake.toml` and `workers.contact-careers-intake.js` appear legacy/alternate worker path; keep for now due deployment risk.

## Files safe to merge
- `contact/contact-hub.js` + `careers/careers-form.js` shared submission helpers into `assets/js/form-submit-core.js`.
- `styles.css`, `responsive.css`, `footer/footer.css`, `assets/mobile-nav.css` into `assets/css/site.css`.
- `site-metadata-defaults.js`, `site-metadata.js`, `site-governance.js` into `site-runtime.js`.

## Files unsafe to touch
- `workers/contact-careers-intake-worker.js`
- `workers.contact-careers-intake.js`
- `workers/solitary-term-worker.js`
- `chatbot/embed.js`, `chatbot/chatbot.css`, `chatbot/fab.css`, `chatbot/behavior.yml`
- Form HTML structures/field names and honeypots in contact/careers pages.
- Endpoints `/submit/contact` and `/submit/careers`.

## Delete/merge triage
### SAFE TO DELETE
- `styles.css`
- `responsive.css`
- `footer/footer.css`
- `assets/mobile-nav.css`
- `site-metadata-defaults.js`
- `site-metadata.js`
- `site-governance.js`

### SAFE TO MERGE
- See “Files safe to merge” section above.

### KEEP
- `site.config.js`
- Worker files under `workers/`
- Chatbot runtime files
- Legal pages and service pages

### REVIEW MANUALLY
- `DEEP_DIVE_FINDINGS_2026-04-23.md`
- `scripts/chatbot-regression-smoke.js`
- `scripts/validate-chatbot-policy-parity.js`
- `wrangler.contact-careers-intake.toml`
- `workers.contact-careers-intake.js`
