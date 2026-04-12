# Contact + Careers Repo Worker

Cloudflare Worker files are now under:

- `workers/contact-careers-intake-worker.js`
- `workers/wrangler.toml`

## Intake routes

Supported POST routes:

- `/api/intake/contact` (legacy alias: `/submit/contact`)
- `/api/intake/careers` (legacy alias: `/submit/careers`)

## Required secret-to-asset mapping

The worker enforces this exact mapping:

- `ASSET_C5T` -> Contact -> Gmail channel
- `ASSET_C5S` -> Careers -> Google Sheets channel

If a secret is missing, the request is rejected.

## Security pipeline

For each payload the worker:

1. strips HTML tags,
2. removes code signatures (script/js/sql/programming tokens),
3. normalizes to plain simple text,
4. rejects suspicious fields,
5. forwards only accepted sanitized payload.

## Upstream relay

Sanitized data is forwarded to:

- `UPSTREAM_WORKER_URL` (default: `https://solitary-term-4203.rulathemtodos.workers.dev/intake`)

Headers include source/channel/asset metadata for the upstream worker.

## CORS + origin allowlist

Allowed origins are controlled by:

- `ALLOWED_ORIGINS`

Default:

- `https://www.gabo.services,https://gabo.services`

## Front-end wiring

Site scripts now post to repo-worker style routes:

- Contact: `.../api/intake/contact`
- Careers: `.../api/intake/careers`

Configured from:

- `window.SITE_METADATA.forms.intakeWorkerBase`
