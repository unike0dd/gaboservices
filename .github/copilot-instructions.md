# Copilot Instructions - Gabriel Professional Services Website

## Website Positioning (Source of Truth)

This repository powers the public website for **Gabriel Professional Services**, positioned as a **human-centered, security-first, compliance-aligned business services platform** for modern digital operations.

Contributors must preserve these positioning principles in all content and implementation updates:

- **Trust-first messaging:** emphasize reliability, secure-by-design operations, and transparent governance.
- **Human-centered UX:** keep content clear, accessible, and action-oriented for real users and decision makers.
- **Compliance-aware delivery:** align technical and content decisions with OPS CyberSec expectations and recognized control frameworks.

## Architecture Overview

This repository hosts a **single-page static site** using plain HTML, CSS, and vanilla JavaScript.

- `index.html` provides semantic page structure and UI targets.
- `styles.css` defines theming, layout, and responsive behavior.
- `main.js` handles dynamic rendering, language toggling, theme toggling, nav interactions, form behavior, and cookie banner state.
- `site.config.js` exposes metadata consumed by `main.js`.

## Development Guidance

- Keep JavaScript framework-free unless explicitly requested.
- Preserve EN/ES bilingual support through the `dictionary` object.
- When adding UI text, ensure it uses `data-i18n` and has both language keys.
- Keep mobile navigation and accessibility attributes (`aria-*`) synchronized.
- Favor small, purpose-driven functions and remove dead code quickly.

## Security & Compliance Guardrails (OPS CyberSec)

All future contributions should follow these baseline guardrails:

1. **OWASP (ASVS/Top 10 aligned)**
   - Do not introduce inline secrets, tokens, or credentials.
   - Sanitize and encode any dynamic content rendered into the DOM.
   - Preserve safe defaults for links/scripts (e.g., `rel`, `referrerpolicy`, and least-privilege third-party embeds).

2. **NIST CSF 2.0 lifecycle alignment (Identify/Protect/Detect/Respond/Recover)**
   - Keep security-relevant repository artifacts current (`.github/workflows`, governance docs, crawler policy files).
   - Ensure CI checks remain enabled for secret scanning and static analysis.
   - Document materially new security controls in `docs/security/control-matrix.md`.

3. **CISA Cyber Essentials operational hygiene**
   - Maintain dependency and workflow update hygiene (Dependabot + patch cadence).
   - Prefer minimally privileged GitHub Actions permissions.
   - Avoid expanding automation trust boundaries without explicit documentation.

4. **PCI DSS 4.0-aware practices (as applicable to web properties)**
   - Never commit account data, authentication data, or sensitive logs.
   - Preserve auditability of security controls through versioned docs and CI policy checks.
   - Keep public crawler directives and site indexing artifacts deterministic and reviewable.

## Files to treat as source of truth

- `index.html`
- `styles.css`
- `main.js`
- `site.config.js`
- `docs/security/control-matrix.md`
