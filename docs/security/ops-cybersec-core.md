# OPS CyberSec Core Compliance Profile

This repository implements a practical compliance baseline for a static website.

## Framework Alignment

### OWASP
- OWASP Top 10 risk reduction via CSP, secure iframe sandboxing, and safe defaults.
- ASVS-oriented controls for configuration, data protection in transit, and secure SDLC checks.

### NIST CSF 2.0
- **Identify**: repository assets + third-party integration inventory.
- **Protect**: secure headers, least privilege workflow permissions.
- **Detect**: scheduled and PR-triggered CodeQL/secret scanning.
- **Respond**: documented disclosure channel and triage process in `SECURITY.md`.
- **Recover**: versioned rollback and post-incident updates.

### CISA Cyber Essentials
- MFA + branch protection expected at org level.
- Vulnerability and misconfiguration scanning integrated in CI.
- Logging/auditability via GitHub Actions history.

### PCI DSS 4.0 (Applicable Controls)
- Req. 6: secure systems and software lifecycle with code scanning.
- Req. 10: auditable action logs through CI and Git history.
- Req. 11: regular testing through scheduled scans.

## Operational Checklist
- [ ] Enforce branch protection and required status checks.
- [ ] Enforce signed commits for privileged maintainers.
- [ ] Route production through HTTPS only with HSTS.
- [ ] Review third-party embeds quarterly.
- [ ] Run incident response tabletop at least annually.
