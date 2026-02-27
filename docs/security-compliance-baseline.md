# Security & Compliance Baseline

This repository now implements a practical baseline for web security and compliance-oriented controls.

## Implemented technical controls

### HTTP security headers (Cloudflare Worker gateway)
- `Content-Security-Policy`
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Cross-Origin-Resource-Policy`
- `Cross-Origin-Opener-Policy`
- `Permissions-Policy`
- CORS allowlist enforcement for approved origins and preflight handling

Source: `chatbot/worker_files/con-artist.gateway.js`.

### Subresource Integrity (SRI)
SRI hashes (`integrity="sha384-..."`) with `crossorigin="anonymous"` were added to local CSS/JS assets referenced by HTML pages to harden script/style loading against tampering.

### SEO and search readiness
- Canonical and hreflang tags are present on route pages.
- Added robots directives with expanded preview controls.
- Added `google-site-verification` meta placeholder for Google Search Console ownership validation.

## Compliance mapping (baseline)

> Important: NIST, CISA, PCI DSS, and OWASP compliance are broader than code changes alone and require ongoing operational, governance, and audit controls.

### NIST CSF (partial technical alignment)
- **Protect**: security headers, CSP, HSTS, SRI, CORS restrictions.
- **Detect**: request validation and error responses in worker gateway.

### CISA Cyber Essentials (partial technical alignment)
- Reduce web attack surface via strict browser policies and hardened transport.
- Enforce origin and asset identity checks at gateway level.

### PCI DSS 4.0 (supportive controls only)
- Supports secure transmission and hardening concepts; does **not** alone establish PCI certification.
- Additional controls required: segmentation, logging/SIEM, vulnerability scans, key management, formal policies, and QSA validation scope.

### OWASP ASVS / Top 10 (partial)
- Mitigates common misconfigurations (A05) via strict headers.
- Reduces XSS/injection risk with CSP + sanitization layers.
- Restricts cross-origin abuse via CORS allowlists and CORP/COOP.

## Remaining required non-code actions
- Replace `REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN` with actual GSC token.
- Run recurring SAST/DAST and dependency audits in CI.
- Maintain incident response, risk register, access reviews, and evidence retention.
- Validate CSP in production telemetry and tune for least privilege.
