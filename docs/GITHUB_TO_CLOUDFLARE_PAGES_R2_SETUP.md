# GitHub → Cloudflare Pages + R2 Setup (for this repo)

This guide is tailored to the current `gaboservices` repository structure (static HTML/CSS/JS, no build step).

---

## 0) What this repo currently is

- Static site entrypoint at `index.html` in repo root.
- Multiple static routes via folders (`about/`, `contact/`, `services/`, `legal/`, etc.).
- Global config in `site.config.js`.
- Cloudflare Pages-compatible `_headers` file already present.
- `CNAME` file already present (custom domain mapping convention).

Because of this, deployment to Cloudflare Pages should use:

- **Framework preset:** `None`
- **Build command:** *(empty)*
- **Build output directory:** `/` (repo root)

---

## 1) Connect GitHub repo to Cloudflare Pages

1. In Cloudflare Dashboard, go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorize GitHub and select this repo.
3. Configure build settings exactly:
   - **Production branch:** `main` (or your default branch)
   - **Framework preset:** `None`
   - **Build command:** leave blank
   - **Build output directory:** `/`
4. Click **Save and Deploy**.

### Verify deployment

After first deploy, verify these routes load:

- `/`
- `/about/`
- `/contact/`
- `/services/`
- `/legal/privacy-gdpr.html`

If a route 404s, check path spelling and case sensitivity.

---

## 2) Add custom domain in Cloudflare Pages

1. Open your Pages project → **Custom domains** → **Set up a custom domain**.
2. Add your apex or subdomain (for example `gaboservices.com` or `www.gaboservices.com`).
3. Let Cloudflare create/validate DNS records.
4. Keep the repo `CNAME` file aligned with your preferred canonical domain.

---

## 3) Create R2 bucket for media assets

1. In Cloudflare Dashboard, go to **R2** → **Create bucket**.
2. Bucket name example: `gaboservices-media`.
3. Keep public access disabled initially.

### Create API token for CI uploads

1. Go to **My Profile** → **API Tokens** in Cloudflare.
2. Create a custom token with permissions:
   - `Account` → `Cloudflare R2:Edit`
   - Scope it to the account used by this project.
3. Save:
   - API Token
   - Account ID

---

## 4) Expose R2 via a public asset domain (recommended)

Use one of these patterns:

- **Option A (simple):** R2 managed domain (`<bucket>.<accountid>.r2.dev`)
- **Option B (production):** Custom subdomain like `cdn.gaboservices.com`

For production, prefer custom domain + Cloudflare proxy for better governance and URL stability.

---

## 5) Add GitHub secrets for automated R2 sync

In GitHub → **Settings** → **Secrets and variables** → **Actions**, add:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `R2_BUCKET_NAME` (example: `gaboservices-media`)

Optional (if using custom CDN domain in app code):

- `PUBLIC_R2_BASE_URL` (example: `https://cdn.gaboservices.com`)

---

## 6) Prepare media folder in this repo

The workflow added in this repo syncs files from:

- `public-media/`

Create it when needed and place assets there, e.g.:

```bash
mkdir -p public-media/images public-media/videos
```

Files uploaded to R2 will keep path structure.

---

## 7) Automated R2 sync via GitHub Actions

This repo includes `.github/workflows/r2-sync.yml`.

Behavior:

- Triggers on pushes to `main` when `public-media/**` changes.
- Installs Wrangler.
- Syncs `public-media/` → `r2://$R2_BUCKET_NAME`.

To test manually:

1. Add a sample media file into `public-media/`.
2. Push to `main`.
3. Open GitHub Actions and confirm workflow passes.
4. Check object appears in R2 bucket.

---

## 8) Link R2 assets in this site

For static HTML in this repo, use absolute CDN URLs.

Example:

```html
<img src="https://cdn.gaboservices.com/images/hero.webp" alt="Hero image" />
<video controls src="https://cdn.gaboservices.com/videos/intro.mp4"></video>
```

For consistency, you can centralize this URL in `site.config.js`:

```js
window.SITE_METADATA = {
  // ...existing values
  mediaBaseUrl: 'https://cdn.gaboservices.com'
};
```

Then construct URLs in runtime JS (`main.js`, chatbot UI, etc.) from `mediaBaseUrl`.

---

## 9) Security and compliance baseline (recommended)

1. **Bucket write access:** CI token only; no broad user credentials.
2. **Transport:** HTTPS only for all media URLs.
3. **Headers/CSP:** ensure CSP allows your CDN domain (`img-src`, `media-src`).
4. **Data governance:** avoid uploading regulated PII/payment data to public media buckets.
5. **Versioning:** use immutable file names for cache busting (`file.hash.ext`).

---

## 10) Cost-control checklist

- Use optimized formats (`webp`, `avif`) for images.
- Keep original large video masters out of repo; upload to R2 only.
- Set cache-control metadata on upload (long TTL for immutable assets).
- Delete orphaned media regularly.

---

## Troubleshooting

### Pages deploy succeeds but assets 404

- Confirm object path in R2 matches URL path exactly.
- Confirm public/custom domain is attached to correct bucket.

### GitHub Action fails authentication

- Re-check `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and `R2_BUCKET_NAME` secrets.
- Confirm the API token has `Cloudflare R2:Edit` permission on the correct account.

### Media blocked by CSP

- Add your CDN domain to `img-src` and `media-src` directives in security headers.

