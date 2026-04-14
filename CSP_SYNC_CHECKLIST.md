# CSP Sync Checklist (Cloudflare Pages + Worker)

Use this checklist whenever CSP console violations appear.

## 1) Confirm whether the violation is enforce or report-only
- Browser console entries marked `report-only` are diagnostics, not hard blocks.
- Enforced failures come from `Content-Security-Policy` (not `Content-Security-Policy-Report-Only`).

## 2) Keep policy sources aligned across all edge layers
If any of these set security headers, they must all carry the same CSP allowlist:
- `_headers` in this repository (Cloudflare Pages static headers).
- Cloudflare dashboard Transform Rules / Managed Rules that modify response headers.
- Any Cloudflare Worker that proxies HTML responses and sets/overwrites CSP headers.

## 3) Worker update rule
Update the Worker **only if** it sets CSP headers for site HTML responses.
- If Worker does not set CSP, update `_headers` only.
- If Worker sets CSP, update both Worker and `_headers` to prevent policy drift.

## 4) Verify with response headers on the exact URL
Check the final, user-facing route (e.g. `/careers/`) and confirm only the intended CSP headers are present.

## 5) Common source entries for this site
- `https://www.gabo.services`
- `https://gabo.services`
- `https://challenges.cloudflare.com`
- `https://static.cloudflareinsights.com`

