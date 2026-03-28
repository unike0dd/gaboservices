# Security Review (Injection/Intrusion Focus)

## Current Security Posture Score

**6.5 / 10** (baseline as of this review).

This repository already has strong foundational protections for a static web property (CSP, HSTS, security headers, origin checks in the worker gateway, and secret scanning workflow). The biggest gap is that several controls are **client-side only**, which can be bypassed by a direct attacker.

## Key Findings

### Strengths

1. **Good baseline HTTP/browser hardening**
   - CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame controls are present in `_headers`.
2. **Gateway-side security controls exist**
   - Worker gateway enforces origin allowlisting, response security headers, and constrained embed parents.
3. **Automated secret scanning in CI**
   - Gitleaks workflow runs on push/PR.

### Weaknesses (Injection/Intrusion)

1. **Client-side “TinyGuard” is bypassable**
   - Input filtering in `main.js` and `chatbot-controls.js` helps UX but does not provide server-side trust.
2. **Turnstile verification appears client-enforced only in this repo**
   - Token is collected client-side; secure validation must happen server-side at submit endpoint.
3. **DOM injection surface through `innerHTML` patterns**
   - Multiple UI sections use `innerHTML`; currently fed from local dictionaries/templates, but future dynamic data could create XSS risk if not escaped.
4. **No explicit rate-limit / abuse-control config in this repo for form endpoints**
   - Intrusion/spam resistance depends on external infra.

## No-Cost Hardening Actions (No New Server Required)

All of the following can be implemented without paid services and without adding a new server type:

1. **Keep gateway URL normalization strict in frontend stream bridge** ✅ implemented in this change.
2. **Reduce future XSS risk by preferring `textContent`/DOM APIs over `innerHTML`** for any future user-influenced values.
3. **Add CSP reporting endpoint only if already available in existing worker** (optional, no extra infra if reused).
4. **Enable stricter branch protection + required security workflow checks** in GitHub settings (free).
5. **Add dependency update automation (Dependabot/Renovate free tier)** for JS tooling and GitHub actions.
6. **Document incident response + key rotation checklist** in repo to improve recoverability.

## Target Score Roadmap

- **6.5 → 7.5**: complete low-effort config/process hardening (checks required, docs/runbooks, remove risky patterns over time).
- **7.5 → 8.5**: enforce server-side verification on all submission flows in existing worker endpoints, with audit logging and rate limiting.
- **8.5 → 9+**: add structured threat modeling cadence and periodic security testing automation.

## Practical Answer to “Can this be done with no cost and no new server?”

**Yes, mostly.**

- You can significantly improve to around **8/10** using current stack + free GitHub/Cloudflare capabilities.
- Going beyond that depends more on operational maturity and strict backend enforcement in your existing worker, not on buying new infrastructure.

## 2026-03 Hardening Update (SEO + OWASP/CISA/NIST/PCI DSS Alignment)

### Changes Applied

1. **Security headers hardened in `_headers`**
   - CSP simplified to host-allowlist model with mixed-content blocking.
   - HSTS increased to 2-year preload profile.
   - Added `X-Permitted-Cross-Domain-Policies: none`.
   - Added scoped CORS policy for `/assets/*`.
2. **Crawler policy updated in `robots.txt`**
   - Default policy is now crawl-allow for all user agents.
   - Kept non-content technical paths disallowed to preserve crawl budget.
3. **Sitemap generation improved for Search Console**
   - `scripts/update-locale-sitemap.js` now includes the English base routes only.
4. **Per-route CSP continuity preserved**
   - Restored page-level CSP meta directives on key routes to preserve existing origin/ID checks expected by current Cloudflare Worker communication paths.
5. **Turnstile-compatible CSP baseline**
   - Added `https://challenges.cloudflare.com` to script/connect/frame directives in `_headers` to align contact-form challenge loading with the site-wide policy.
6. **Scoped static asset CORS retained**
   - `/assets/*` keeps explicit `Access-Control-Allow-Origin: https://www.gabo.services` for strict origin control on static asset reads.
7. **YouTube privacy-enhanced embed readiness added**
   - `frame-src` now includes `https://www.youtube-nocookie.com` so HTML5/video content strategy can expand without loosening the rest of the CSP baseline.
8. **CSP header duplication removed**
   - Kept a single authoritative `Content-Security-Policy` entry in `_headers` to avoid policy drift from duplicated report-only declarations.

### Compliance Mapping (practical)

- **OWASP ASVS / Top 10:** CSP, clickjacking protection, MIME sniffing prevention, strict referrer, mixed-content blocking.
- **CISA Cyber Essentials:** secure configuration baseline + external attack-surface reduction via restrictive headers.
- **NIST CSF (Protect/Detect):** preventive browser controls + explicit policy artifacts that are auditable in-repo.
- **PCI DSS 4.0 (Req. 6, 8, 10, 11 aligned support):** secure coding controls, hardening evidence in version control, and repeatable security config update scripts.

### Google Search Console Readiness

- Crawl access enabled globally.
- Sitemap endpoint preserved and machine-readable.
