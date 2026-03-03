# Cloudflare Turnstile and ID Verification Flows

## Short answer
Adding Cloudflare Turnstile to the site should **not** negatively affect an ID-required flow by itself, as long as it is implemented as a pre-check for abuse prevention and not as a replacement for identity verification.

## How to place Turnstile in the flow

Recommended sequence:
1. User opens a sensitive form (signup, account recovery, checkout, or ID upload request).
2. User completes Turnstile challenge/token.
3. Backend verifies Turnstile token server-side.
4. If token is valid, continue to your ID verification step (KYC, document upload, selfie match, etc.).

This keeps responsibilities separated:
- Turnstile = bot/spam abuse mitigation.
- ID verification = human identity assurance and compliance.

## What can break if implemented incorrectly

Potential issues are usually integration mistakes, not Turnstile itself:
- Blocking legitimate users with aggressive challenge settings.
- Not verifying Turnstile token server-side.
- Using Turnstile outcome as proof of legal identity.
- Not handling challenge failures/timeouts with retry UX.
- Applying challenge on every step (causes friction for users already in verified sessions).

## Implementation guidance

- Verify Turnstile token on the server for every protected action.
- Add fallback/retry and clear user messaging when challenge fails.
- Use risk-based triggering (e.g., new device, high velocity, suspicious IP, repeated failures) instead of always-on where possible.
- Keep ID verification controls unchanged for regulatory and trust requirements.
- Log verification outcomes and errors for auditability and incident response.

## Compliance and security note

For regulated or high-assurance scenarios, Turnstile should be treated as a **supporting control** in Protect/Detect layers, while ID verification remains a distinct control for business, legal, and compliance obligations.
