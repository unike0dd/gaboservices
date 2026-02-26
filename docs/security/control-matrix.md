# Security Control Matrix

This matrix maps implemented repository controls to OPS CyberSec expectations and external frameworks:

- OWASP (Top 10 / ASVS intent)
- NIST CSF 2.0
- CISA Cyber Essentials
- PCI DSS 4.0

## Control Crosswalk

| Implemented Control | Repository Evidence | OWASP | NIST CSF 2.0 | CISA Cyber Essentials | PCI DSS 4.0 |
|---|---|---|---|---|---|
| Secret scanning in CI (Gitleaks) | `.github/workflows/security-compliance.yml` (`secret-scan`) | A02 Cryptographic Failures / A05 Security Misconfiguration (prevent exposed secrets) | DE.CM, PR.PS | Data Protection, Security Tools | Req. 3, Req. 6, Req. 10 |
| Static code analysis in CI (CodeQL) | `.github/workflows/security-compliance.yml` (`codeql-analysis`) | A03 Injection / A08 Software & Data Integrity Failures | DE.CM, PR.PS, GV.OV | Vulnerability Management | Req. 6.3, Req. 6.4 |
| Policy-integrity CI checks for governance artifacts and crawler linkage | `.github/workflows/security-compliance.yml` (`policy-integrity`) | A05 Security Misconfiguration | GV.PO, ID.GV, PR.PS | Governance, Cyber Hygiene | Req. 12 |
| Repository governance guidance for contributors | `.github/copilot-instructions.md` | ASVS V1 Governance & Architecture | GV.PO, GV.RM | Governance | Req. 12 |
| Crawler policy allow/deny model with canonical sitemap link | `robots.txt`, `sitemap.xml` | A05 Security Misconfiguration (exposure minimization) | ID.AM, PR.PS | Cyber Hygiene | Req. 12 |
| Automated dependency update hygiene for workflow supply chain | `.github/dependabot.yml` | A06 Vulnerable and Outdated Components | PR.PS, DE.CM | Vulnerability Management | Req. 6.3.3 |

## Notes

- This control matrix is living documentation and must be updated whenever security controls are added, removed, or materially changed.
- Framework mappings are intent-based and should be validated by compliance owners for formal assessments.
