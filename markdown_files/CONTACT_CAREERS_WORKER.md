# Contact + Careers Intake Worker

This repository includes a Cloudflare Worker script at:

- `workers.contact-careers-intake.js`

Deployment template:

- `wrangler.contact-careers-intake.toml`

## Routes and channel mapping

- `POST /submit/contact` → **Gmail** channel using secret asset id `ASSET_C5T`
- `POST /submit/careers` → **Google Sheets** channel using secret asset id `ASSET_C5S`

The worker only forwards sanitized plain-text payloads.

## Secret/asset requirements

- `ASSET_C5T` and `ASSET_C5S` are required.
- Each secret is validated as a likely asset-id format before forwarding.
- Route-to-secret mapping is strict and fixed:
  - Contact route can only use `ASSET_C5T`
  - Careers route can only use `ASSET_C5S`

## Sanitization and screening pipeline

1. Allowlist expected fields per route (unknown fields are dropped).
2. Strip HTML tags.
3. Remove script/code/SQL-like tokens.
4. Normalize to plain text characters.
5. Score suspicious payload patterns and reject flagged fields.

## Relay behavior

Accepted submissions are forwarded to:

- `${REMOTE_WORKER_URL || "https://solitary-term-4203.rulathemtodos.workers.dev"}/intake`

Payload includes:

- `source` (`contact` or `careers`)
- `channel` (`gmail` or `gsheets`)
- `asset` (matching route secret)
- `data` (sanitized fields)
- `scan` (sanitization metrics)

## CORS/origin controls

- Origins are restricted by `ALLOWED_ORIGINS` (comma-separated).
- Default includes:
  - `https://www.gabo.services`
  - `https://gabo.services`

## Front-end integration

- `contact/contact-hub.js` submits to `${forms.intakeBaseUrl}/submit/contact`
- `careers/careers-form.js` submits to `${forms.intakeBaseUrl}/submit/careers`
- `site.config.js` sets `forms.intakeBaseUrl`
- `_headers` allows connect-src for the worker origin
