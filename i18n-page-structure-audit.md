# i18n Page Structure Audit (English / Spanish)

## What exists today

The repository currently uses a **single URL path per page** with language chosen via query string (`?lang=en` / `?lang=es`) and client-side translation.

- Global pages found:
  - `/` (`index.html`)
  - `/about/`
  - `/services/`
  - `/pricing/`
  - `/careers/`
  - `/contact/`
  - `/learning/`
- Service detail pages found:
  - `/services/logistics-operations/`
  - `/services/administrative-backoffice/`
  - `/services/customer-relations/`
  - `/services/it-support/`
- Legal pages found:
  - `/legal/terms`
  - `/legal/cookies`
  - `/legal/privacy-gdpr`

All of these pages expose language controls and bilingual rendering in the same physical files.

## Where English and Spanish live

### English side

- `language-codes.js` contains the primary EN dictionary used by most site pages.
- `assets/legal-i18n.js` contains EN legal copy and legal-page metadata.
- HTML pages include EN alternate URLs with `hreflang="en"` pointing to `?lang=en`.

### Spanish side

- `language-codes.js` contains the primary ES dictionary used by most site pages.
- `assets/legal-i18n.js` contains ES legal copy and legal-page metadata.
- HTML pages include ES alternate URLs with `hreflang="es"` pointing to `?lang=es`.

## Best place to move them

If the goal is clearer organization + stronger SEO/i18n governance, the best target is:

- Move EN pages under: `en/`
- Move ES pages under: `es/`

Recommended URL model:

- EN home: `/en/`
- ES home: `/es/`
- EN about: `/en/about/`
- ES about: `/es/about/`
- EN service detail: `/en/services/it-support/`
- ES service detail: `/es/services/it-support/`

### Why this is the best location

1. **SEO clarity**: language-specific URLs are easier for search engines than query-parameter toggles.
2. **Analytics clarity**: traffic segmentation by locale is simpler.
3. **Routing consistency**: avoids appending `?lang=` to every internal link.
4. **Scalability**: supports adding more locales later (`/pt/`, `/fr/`, etc.) without reworking URL strategy.
5. **Governance/compliance readiness**: locale-specific legal pages become easier to version and audit.

## Practical migration approach

1. Create top-level locale folders: `en/` and `es/`.
2. Start with high-traffic pages (`/`, `/services/`, `/contact/`).
3. Keep current pages temporarily and 301-redirect:
   - `/?lang=en` -> `/en/`
   - `/?lang=es` -> `/es/`
4. Update canonical and `hreflang` to point at path-based locales.
5. Split dictionaries by locale namespace if desired:
   - `i18n/en/*.json`
   - `i18n/es/*.json`
6. Update `sitemap.xml` with both locale trees.

## Suggested folder layout

```
/en/
  index.html
  about/index.html
  services/index.html
  services/logistics-operations/index.html
  services/administrative-backoffice/index.html
  services/customer-relations/index.html
  services/it-support/index.html
  pricing/index.html
  careers/index.html
  contact/index.html
  learning/index.html
  legal/terms.html
  legal/cookies.html
  legal/privacy-gdpr.html

/es/
  index.html
  about/index.html
  services/index.html
  services/logistics-operations/index.html
  services/administrative-backoffice/index.html
  services/customer-relations/index.html
  services/it-support/index.html
  pricing/index.html
  careers/index.html
  contact/index.html
  learning/index.html
  legal/terms.html
  legal/cookies.html
  legal/privacy-gdpr.html
```

