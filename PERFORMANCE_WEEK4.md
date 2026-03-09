# Week 4 Mobile Performance Baseline

This iteration adds lightweight runtime optimizations and a repeatable Lighthouse workflow.

## What changed

- Added `content-visibility: auto` and `contain-intrinsic-size` on `.section` blocks to reduce offscreen rendering cost while preserving layout stability.
- Added a `prefers-reduced-motion: reduce` override to reduce animation/transition work and improve accessibility on constrained devices.
- Added `.lighthouserc.json` with mobile emulation targets for:
  - `/index.html`
  - `/services/index.html`

## Run local Lighthouse baseline

1. Start local server:
   ```bash
   python3 -m http.server 4173 --directory /workspace/gaboservices
   ```
2. In another terminal, run:
   ```bash
   npx -y @lhci/cli autorun --config=.lighthouserc.json
   ```

## Suggested acceptance goals (mobile)

- Performance: >= 80
- Accessibility: >= 95
- Best Practices: >= 95
- SEO: >= 95

These are practical targets for iterative improvement and can be tightened over time.
