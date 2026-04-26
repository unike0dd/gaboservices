# Contact + Careers Communication Path Alignment (Repo ↔ Cloudflare Worker)

## Purpose
This document defines the **exact communication contract** between the repository form clients and the Cloudflare Worker intake layer, with chatbot traffic kept fully separate.

## What was implemented

### 1) Repo form clients now use dedicated v1 intake routes
- `contact/contact-hub.js`
  - `submitPath` set to: `/v1/intake/contact`
- `careers/careers-form.js`
  - `submitPath` set to: `/v1/intake/careers`

### 2) Worker route contract updated to match repo
- `workers/solitary-term-worker.js`
  - Added v1 routes:
    - `/v1/intake/contact`
    - `/v1/intake/careers`
  - Kept legacy compatibility:
    - `/submit/contact`
    - `/submit/careers`
  - Health response now exposes both v1 and legacy route keys.
  - Route resolution maps both v1 and legacy inputs into the same internal relay destinations:
    - Contact -> internal `/contact`
    - Careers -> internal `/careers`

### 3) New dedicated Worker profile created for deployment alignment
- Added `wrangler.contact-careers-v1.toml`
  - Worker name: `solitary-intake-v1`
  - Main entry: `workers/solitary-term-worker.js`
  - Purpose: provide a deployment profile dedicated to Contact/Careers v1 intake communication.

---

## End-to-end communication path

### Contact
1. Browser form (`contact/contact-hub.js`) submits to `/v1/intake/contact`.
2. `assets/js/form-submit-core.js` sends JSON + security headers:
   - `x-ops-asset-id`
   - `x-gabo-parent-origin`
3. CF Worker (`solitary-term-worker.js`) validates origin/asset/payload.
4. Worker relays via `DELIVERY` service binding to internal `/contact`.
5. Internal worker (`workers.contact-careers-intake.js`) forwards to Apps Script bridge.

### Careers
1. Browser form (`careers/careers-form.js`) submits to `/v1/intake/careers`.
2. `assets/js/form-submit-core.js` sends JSON + security headers:
   - `x-ops-asset-id`
   - `x-gabo-parent-origin`
3. CF Worker (`solitary-term-worker.js`) validates origin/asset/payload.
4. Worker relays via `DELIVERY` service binding to internal `/careers`.
5. Internal worker (`workers.contact-careers-intake.js`) forwards to Apps Script bridge.

---

## Separation guarantee (chatbot vs intake)
- Chatbot path remains: `POST /api/chat` on chatbot worker base.
- Contact/Careers intake paths are now dedicated to:
  - `POST /v1/intake/contact`
  - `POST /v1/intake/careers`
- No Contact/Careers form route posts to `/api/chat`.
- No chatbot request path posts to `/v1/intake/*`.

---

## Deployment notes for Cloudflare
1. Deploy intake worker profile using:
   - `wrangler publish -c wrangler.contact-careers-v1.toml`
2. Ensure service binding + secrets are configured:
   - `DELIVERY` service binding to internal relay worker
   - `ASSET_C5T`, `ASSET_C5S`, `SOLITARY_TO_CORREO_SHARED_SECRET`
3. Attach domain/route for intake endpoints, e.g.:
   - `intake.gabo.services/v1/intake/*`
4. Keep chatbot worker deployment/profile separate from this intake profile.

