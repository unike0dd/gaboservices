# Repo Deep Dive Findings (2026-04-23)

## Scope and method
- Ran the existing repository validation scripts.
- Performed targeted static checks on workflows and Cloudflare Worker code.
- Attempted an actual ESM load of the intake worker to confirm runtime parse behavior.

## What is currently not working

### 1) GitHub Actions workflows are not discoverable by GitHub
All workflow files under `.github/workflows` are named without a `.yml` or `.yaml` extension:
- `.github/workflows/deploy-pagesyml`
- `.github/workflows/security-complianceyml`
- `.github/workflows/wiki-dickie-syncyml`

Because GitHub only loads workflow files with `.yml`/`.yaml` names in `.github/workflows`, these automations will not run.

### 2) Intake worker in `workers/` cannot load as an ES module
`workers/contact-careers-intake-worker.js` redeclares `const route` in the same function scope and also references symbols that are not declared in that file path (`resolveRouteByAsset`, `jsonResponse`, `payload`, `config`).

Repro command (fails):
```bash
node -e "import('./workers/contact-careers-intake-worker.js').catch(e=>{console.error(e.message);process.exit(1);})"
```
Observed error:
- `Identifier 'route' has already been declared`

Impact:
- If this worker entrypoint is used/deployed, it will fail before serving requests.

### 3) Existing JS syntax check gives a false green for worker module compatibility
`scripts/check-js-syntax.mjs` reports success, but it relies on `node --check` per file.

This check did not catch the module-load failure above. So current CI guardrails can miss ESM/runtime parse issues in worker code paths.

## What appears to be working
- i18n scope validation script passes.
- chatbot policy parity script passes.
- chatbot regression smoke script passes.
- locale artifact sync script passes.

## Execution plan requested (solve #2 and #3 first; #1 last)

### Phase A — Fix issue #2 (worker entrypoint integrity)
1. **Pick a single source of truth for intake worker logic**
   - Keep `workers.contact-careers-intake.js` as canonical implementation (it currently contains fuller protections and coherent flow).
   - Replace `workers/contact-careers-intake-worker.js` with either:
     - a thin compatibility wrapper that re-exports/imports canonical logic, or
     - a synchronized copy generated from one source file.
2. **Remove inconsistent symbols and duplicate declarations**
   - Eliminate duplicate `const route` declaration in same scope.
   - Remove references to undeclared `resolveRouteByAsset`, `jsonResponse`, `payload`, `config`.
3. **Define deterministic worker contract tests**
   - Add node-based request/response tests for:
     - allowed route + POST + allowed origin
     - invalid route (404)
     - wrong method (405)
     - payload too large (413)
     - suspicious payload (422)
4. **Add a hard gate for worker module loadability**
   - CI check must run ESM import validation on worker entrypoints used in deployment paths.

### Phase B — Fix issue #3 (false-green syntax guard)
1. **Upgrade JS validation script**
   - Keep fast `node --check` pass for baseline syntax.
   - Add explicit module-load checks for ESM worker files via dynamic import in a subprocess.
2. **Publish machine-readable validation output**
   - Add a small JSON report under `reports/` with per-file check results and failure reason.
3. **Wire into security/compliance workflow**
   - Ensure the upgraded checker is called before deployment-related jobs and fails fast on any worker parse/load error.

### Phase C — Leave issue #1 for last (workflow filenames)
1. Rename workflow files to `*.yml` in one dedicated PR after Phases A/B stabilize.
2. Re-run CI and verify GitHub Actions discovery and trigger behavior on push + PR.
3. Backfill documentation so future workflow files use compliant naming conventions by default.
