# Contact + Careers Intake Worker

This repository now includes a Cloudflare Worker script at:

- `workers.contact-careers-intake.js`

## Purpose

The worker accepts two secure intake routes:

- `POST /submit/contact` → routed to **Gmail** channel using `ASSET_C5T`.
- `POST /submit/careers` → routed to **Google Sheets** channel using `ASSET_C5S`.

Both routes sanitize and filter payloads to plain text only.

## Security/Sanitization behavior

The worker:

1. Removes HTML tags.
2. Removes code-like patterns (`<script`, `javascript:`, function-like tokens, SQL keywords, etc.).
3. Applies a plain-text allowlist.
4. Rejects suspicious fields when code density is high.

Only accepted sanitized data is forwarded.

## Relay target

The worker relays accepted submissions to:

- `https://solitary-term-4203.rulathemtodos.workers.dev/intake`

Override with env var:

- `REMOTE_WORKER_URL`

## Required secrets

- `ASSET_C5T`
- `ASSET_C5S`

## Front-end integration

The following forms now submit JSON directly to the worker endpoints:

- `contact/contact-hub.js` → `/submit/contact`
- `careers/careers-form.js` → `/submit/careers`

`_headers` was updated to allow `connect-src` to the solitary-term worker origin.
