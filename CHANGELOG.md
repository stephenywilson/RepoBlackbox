# Changelog

All notable changes to RepoBlackbox are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/)

---

## [0.1.1] — 2025-05-03

### Added
- Machine-readable `latest-scope.json` written by `repoblackbox scope`
- Forbidden pattern audit: files matching `--forbid` patterns are flagged as **HIGH** risk scope violations
- Out-of-scope change warnings: files changed outside `--allow` patterns flagged as **MEDIUM** risk
- `src/utils/pattern.ts` — zero-dependency glob-like pattern matcher
- `scripts/smoke-test.sh` — full end-to-end smoke test running in `/tmp`
- `npm run smoke` script
- `postbuild` step: `chmod +x dist/cli.js` ensures the binary is executable after compilation

### Changed
- `AuditResult` interface extended with `scopeViolations` and `outOfScopeFiles` fields
- `RiskFlags` extended with `scopeViolationCount` and `outOfScopeCount`
- `computeRiskLevel` updated: scope violations always escalate to HIGH
- Audit markdown and JSON now include dedicated scope violation and out-of-scope sections
- Report includes dedicated Scope Violations and Out-of-Scope sections
- README: added concrete example workflow, Important Clarifications section, and expanded audit detection list
- Version bumped from `0.1.0` to `0.1.1`

---

## [0.1.0] — 2025-05-03

### Added
- `repoblackbox init` — creates `.repoblackbox/` directories, config, and four safety documents
- `repoblackbox scope` — interactive and flag-based task scope definition, writes `TASK_SCOPE.md`
- `repoblackbox snapshot <label>` — SHA-256 hash-based repo state capture; sensitive files recorded without reading content
- `repoblackbox audit` — file-level diff vs latest snapshot, built-in risk classification (LOW / MEDIUM / HIGH)
- `repoblackbox report` — full Markdown AI coding run report with summary, changed files, risk flags, and review checklist
- Default protected file patterns (env, lock files, auth, billing, API, database, CI/CD, deployment)
- Five template documents: `AGENT_RULES.md`, `PROJECT_CONTEXT.md`, `PROTECTED_FILES.md`, `TASK_SCOPE.md`, `REPORT_TEMPLATE.md`
- Git integration: branch, commit, status recorded in snapshot; `git diff --numstat` used for large-change detection
- TypeScript source, CommonJS compilation, Apache-2.0 license

---

## Planned

### [0.2.0]
- Safer rollback workflow
- GitHub PR comment support
- CI mode with non-zero exit codes on HIGH risk
- Stricter protected-file policy
- Project presets (Next.js, Remix, SvelteKit, etc.)

### [0.3.0]
- Claude Code / Cursor / Codex workflow presets
- MCP integration exploration
- Team policy files
- HTML report output
