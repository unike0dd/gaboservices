# Security Policy (OPS CyberSec Core)

This repository follows an **OPS CyberSec Core Governance** model aligned to:
- **OWASP** (Top 10 + ASVS principles)
- **NIST CSF 2.0**
- **CISA Cyber Essentials**
- **PCI DSS 4.0** (controls relevant to web platform and SDLC)

## Supported Scope
- Static website source code in this repository
- CI/CD workflows and deployment configuration
- Client-side JavaScript and content integrity

## Vulnerability Reporting
Report security issues privately to: **security@gabos.io**.

Please include:
- impact summary
- affected path(s)
- reproduction steps / proof-of-concept
- suggested mitigation (if available)

## Secure Development Baseline
1. All changes must go through pull requests with review.
2. Secret scanning and static analysis run in CI.
3. Security headers and TLS-only delivery are required in production.
4. Third-party scripts/iframes must be explicitly justified and least-privilege sandboxed.
5. Incident response and recovery evidence must be documented for material events.

## Governance Mapping (High-Level)
- **Identify**: asset inventory, dependency/secret review in CI.
- **Protect**: secure headers, HTTPS, least privilege, branch protection.
- **Detect**: CodeQL + secret scanning + scheduled checks.
- **Respond**: security issue workflow and private disclosure channel.
- **Recover**: rollback-ready Git history and post-incident corrective actions.
