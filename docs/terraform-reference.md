# Terraform Reference (for `gaboservices`)

This reference gives a practical Terraform baseline for this repository’s current architecture:
- static multi-page website content in this repo (root HTML/CSS/JS)
- Cloudflare edge integration (Worker-hosted chatbot gateway and Cloudflare Insights references)
- strict security-header posture already represented in `_headers`

---

## 1) Suggested Terraform scope for this repo

Start with **infrastructure that is already implied by the codebase**:

1. Cloudflare DNS records for `gabo.services` and subdomains.
2. Cloudflare Worker deployment wiring for chatbot gateway route(s).
3. Optional Cloudflare zone settings that complement existing CSP/HSTS strategy.

Keep application content deployment (HTML/CSS/JS) in your existing delivery workflow unless you explicitly migrate to Pages + CI-based artifact publishing.

---

## 2) Recommended project layout

Create a dedicated infra folder:

```txt
infra/
  terraform/
    providers.tf
    versions.tf
    variables.tf
    terraform.tfvars.example
    main.tf
    dns.tf
    worker.tf
    outputs.tf
    README.md
```

This keeps infra lifecycle isolated from frontend source changes.

---

## 3) Minimal Terraform baseline

> Notes:
> - Replace placeholders (`<...>`) with your actual values.
> - Prefer remote state (S3/R2/Terraform Cloud) for team usage.

### `versions.tf`

```hcl
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}
```

### `providers.tf`

```hcl
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
```

### `variables.tf`

```hcl
variable "cloudflare_api_token" {
  description = "Cloudflare API token with least-privilege permissions"
  type        = string
  sensitive   = true
}

variable "zone_id" {
  description = "Cloudflare Zone ID for gabo.services"
  type        = string
}

variable "root_domain" {
  description = "Primary domain"
  type        = string
  default     = "gabo.services"
}

variable "worker_name" {
  description = "Cloudflare Worker name for chatbot gateway"
  type        = string
  default     = "con-artist-gateway"
}
```

### `dns.tf`

```hcl
resource "cloudflare_record" "root" {
  zone_id = var.zone_id
  name    = "@"
  type    = "CNAME"
  content = "<target-hostname>"
  proxied = true
}

resource "cloudflare_record" "www" {
  zone_id = var.zone_id
  name    = "www"
  type    = "CNAME"
  content = var.root_domain
  proxied = true
}
```

### `worker.tf` (route binding example)

```hcl
resource "cloudflare_worker_script" "chatbot_gateway" {
  name    = var.worker_name
  content = file("../chatbot/worker_files/con-artist.gateway.js")
}

resource "cloudflare_worker_route" "chatbot_route" {
  zone_id     = var.zone_id
  pattern     = "${var.root_domain}/chatbot/*"
  script_name = cloudflare_worker_script.chatbot_gateway.name
}
```

### `outputs.tf`

```hcl
output "worker_name" {
  value = cloudflare_worker_script.chatbot_gateway.name
}
```

---

## 4) Security and compliance guardrails (recommended)

1. **Least privilege token** for Terraform:
   - Zone:DNS Edit
   - Zone:Workers Scripts Edit
   - Zone:Workers Routes Edit
   - Zone:Zone Settings Read (if needed)
2. Keep secrets out of git:
   - use `TF_VAR_cloudflare_api_token` env var
   - do not commit `terraform.tfvars` with real secrets
3. Plan/apply workflow:
   - pull request runs `terraform fmt -check`, `terraform validate`, `terraform plan`
   - protected branch required before `terraform apply`
4. State security:
   - remote backend with locking
   - encrypted state storage
5. Change control:
   - one infra change per PR when possible
   - attach plan summary to PR body

---

## 5) Operational commands (quick reference)

From `infra/terraform`:

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

For teardown safety:

```bash
terraform plan -destroy
```

---

## 6) Repo-specific notes

- This repository already contains a Cloudflare Worker gateway implementation at:
  - `chatbot/worker_files/con-artist.gateway.js`
- Current content and headers indicate a security-first static deployment model (`_headers` + CSP in HTML).
- Terraform should manage edge infrastructure and DNS first; only then expand to broader platform resources if needed.

---

## 7) Suggested next iteration

1. Add `infra/terraform/README.md` with exact token scope screenshots/checklist.
2. Add CI workflow for `terraform fmt/validate/plan` on PR.
3. Split environments with `workspaces` or `envs/dev`, `envs/prod` module composition.
4. Add policy checks (e.g., OPA/Conftest or Terraform Cloud policy sets).

