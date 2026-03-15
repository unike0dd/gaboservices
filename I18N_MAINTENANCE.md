# i18n Maintenance Guide (Phase 1)

This project uses bilingual EN/ES content with generated locale pages under `/en` and `/es`.

## Single Source of Truth

Do **not** edit generated locale files directly in:

- `en/**`
- `es/**`

Edit source content only in:

- `language-codes.js` (main page copy and dictionary values)
- `assets/legal-i18n.js` (legal page translated copy)
- base route templates (for structure, markup, and data-i18n bindings)

## Required Update Flow

1. Update source dictionary/legal content and/or base templates.
2. Regenerate locale pages:
   - `node scripts/build-en-locale-pages.js`
   - `node scripts/build-es-locale-pages.js`
3. Regenerate locale routing artifacts when route coverage changes:
   - `node scripts/update-locale-sitemap.js`
   - `node scripts/update-locale-redirects.js`
4. Run the drift check:
   - `node scripts/check-locale-generated.js`

## CI Guardrail

CI runs `scripts/check-locale-generated.js` to ensure generated locale pages are in sync with sources.

If the check fails, regenerate locale pages and commit updated artifacts.

## Policy

- Locale outputs are generated artifacts.
- Source dictionaries and templates are authoritative.
- Pull requests should avoid manual copy edits in `en/**` and `es/**` unless produced by generator scripts.


## Phase 2 Scope Governance

Translation scope is tracked in `i18n-translation-scope.json`:

- `criticalKeys`: keys that must exist in both EN and ES to preserve core UX, forms, legal/footer navigation, and chatbot controls.

Run Phase 2 validation:

- `node scripts/validate-i18n-scope.js`

Validation behavior:

- Fails if any critical key is missing/empty in either locale.
- Reports (non-fatal) optional parity gaps for backlog management.
- Reports how many critical keys are actively referenced by `data-i18n*` attributes in templates/scripts.


## Phase 3 Automation & Reporting

Generate an integrity report artifact (for CI logs and release KPI tracking):

- `node scripts/validate-i18n-scope.js --report reports/i18n-integrity-report.json`

This report includes:

- Critical coverage status by locale
- Optional parity gap counts by locale
- Dead dictionary keys (keys not referenced by `data-i18n*` in source templates/scripts)
- Aggregate totals for trend tracking

Use `I18N_RELEASE_CHECKLIST.md` for release gating and KPI capture.
