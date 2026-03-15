# i18n Release Checklist (Phase 3)

Use this checklist for every release that includes copy, template, routing, or locale changes.

## Required pre-merge checks

- [ ] Run `node scripts/validate-i18n-scope.js --report reports/i18n-integrity-report.json`
- [ ] Confirm critical coverage passes (no missing critical keys in EN/ES)
- [ ] Review optional parity gaps and log intentional backlog items
- [ ] Review dead-key list in report and remove stale keys when safe
- [ ] Run `node scripts/check-locale-generated.js`
- [ ] If routes changed, run:
  - `node scripts/update-locale-sitemap.js`
  - `node scripts/update-locale-redirects.js`

## Release KPI snapshot

Record these values each release from `reports/i18n-integrity-report.json`:

1. `totals.dictionaryUnion`
2. `totals.critical`
3. `totals.optional`
4. `totals.deadKeys`
5. `critical.missingInEn.length`
6. `critical.missingInEs.length`
7. `optional.missingInEn.length`
8. `optional.missingInEs.length`

## Success criteria

- Critical gaps remain at **0** in both locales.
- Dead-key count trends down over time.
- Optional parity gaps are tracked deliberately and reduced iteratively.
