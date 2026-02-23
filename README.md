# Gabriel Professional Business Services (Pure HTML/CSS/JS)

This repository is now a **zero-JSON, static web project**:
- `index.html`
- `styles.css`
- `main.js`
- `site.config.js` (JS metadata/config replacement)

## Run locally (no Node required)

Use any static file server. Two easy options:

```bash
python -m http.server 3000
```

or

```bash
npx serve .
```

Then open:

- `http://localhost:3000`

## JSON replacement notes

- Removed `metadata.json` and replaced it with `site.config.js`.
- Removed `package.json` and `package-lock.json` so the project is no longer tied to npm.
- Removed build tooling config dependency to keep this repository fully static.
