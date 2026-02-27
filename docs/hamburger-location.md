# Hamburger Menu (☰) Location Audit

The hamburger icon (`☰`) is rendered by the same navigation toggle button on these pages:

- `index.html`
- `about/index.html`
- `pricing/index.html`
- `services/index.html`
- `services/logistics-operations/index.html`
- `services/it-support/index.html`
- `services/administrative-backoffice/index.html`
- `services/customer-relations/index.html`
- `contact/index.html`
- `careers/index.html`

Implementation pattern used in each page:

```html
<button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="primaryNav">☰</button>
```

UI placement is controlled in `styles.css`:

- Fixed-position floating button
- Anchored to the **bottom-right** (`right: var(--nav-fab-offset-x); bottom: var(--nav-fab-offset-y);`)
- Circular 3.4rem button with high z-index (`z-index: 93`)

This means users will see the `☰` as a floating action-style menu trigger near the lower-right corner of the viewport.
