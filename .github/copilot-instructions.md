# Copilot Instructions - Gabriel Professional Services Website

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

## Files to treat as source of truth

- `index.html`
- `styles.css`
- `main.js`
- `site.config.js`
