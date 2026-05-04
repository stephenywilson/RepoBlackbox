# Changelog

All notable changes to RepoBlackbox are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/)

---

## [0.3.1] — 2026-05-04

### Changed
- README Quick Start now uses `npm install -g repoblackbox` as the primary install path
- Moved source installation into a separate Development install section
- Removed outdated "npm will be available after first npm release" note
- No CLI behavior changes

---

## [0.3.0] — 2026-05-04

### Added
- **Agent Skill Packs** — structured workflow prompts for AI coding agents
- New command group: `repoblackbox skill list / show / use`
- 10 built-in skills:
  - `github-release-polish` — prepare an open-source repo for a GitHub release
  - `readme-audit` — audit a README for clarity and install accuracy
  - `repo-url-fix` — fix wrong repo URLs after a rename or ownership change
  - `security-privacy-scan` — scan for private paths, API keys, and internal references
  - `npm-package-release-check` — prepare a Node/TS CLI for npm publishing (no publish)
  - `python-package-release-check` — prepare a Python CLI for PyPI release (no publish)
  - `cli-smoke-test` — add or improve a CLI smoke test
  - `changelog-update` — update CHANGELOG for a new version
  - `ui-screenshot-audit` — generate targeted polish from UI screenshots
  - `agent-safe-refactor` — constrained refactor with explicit allowed/forbidden files
- Variable substitution via `--var key=value` (repeatable)
- `--output <file>` support to write rendered prompts to disk
- Lightweight YAML frontmatter parser — no external dependencies
- `docs/agent-skill-packs.md` — full reference for skill format, variables, and examples
- `skills/` directory shipped with the npm package

### Changed
- Project positioning extended to **"safety, evaluation, and workflow layer"** for AI coding agents
- `package.json` description, keywords, and CLI description updated accordingly
- `package.json` version bumped to 0.3.0
- `package.json` files field includes `skills/`
- README extended with Agent Skill Packs section
- README commands table includes `skill list / show / use`
- README roadmap updated

### Notes
- All v0.1.x and v0.2.x behavior preserved — `init`, `scope`, `snapshot`, `audit`, `report`, and `bench` unchanged
- No API calls, no external services, no telemetry
- RepoBlackbox **never** runs AI agents automatically — it only renders prompt text
- `skill use` prints or writes text; it does not execute prompts

---

## [0.2.0] — 2026-05-04

### Added
- **Agent Task Bench** — local benchmark tasks for evaluating AI coding agents
- New command group: `repoblackbox bench list / prepare / score / report / demo`
- 5 built-in benchmark tasks:
  - `readme-url-fix` — fix a wrong clone URL without touching forbidden files
  - `package-version-sync` — sync CLI `--version` output with `package.json`
  - `docs-toc-update` — add a missing entry to a README Table of Contents
  - `security-cleanup` — remove a personal local path and a mock placeholder key
  - `forbidden-file-guard` — make a one-line docs change without touching forbidden files
- 8 deterministic check types: `file_contains`, `file_not_contains`, `file_exists`, `file_unchanged`, `file_changed`, `pattern_absent`, `forbidden_untouched`, `max_changed_files`
- Hash-based baseline diffing for changed/added/deleted file detection
- Markdown and JSON bench reports under `.repoblackbox/bench/reports/`
- `bench demo` runs a fully self-contained demonstration with no AI required
- `docs/agent-task-bench.md` — full reference for task format, check types, and custom tasks
- `benchmark/` directory shipped with the npm package

### Changed
- Project positioning extended from "safety layer" to **"safety and evaluation layer"** for AI coding agents
- `package.json` description, keywords, and CLI `--description` updated accordingly
- README rewritten in places to mention Agent Task Bench while preserving v0.1.x positioning
- `package.json` version bumped to 0.2.0
- `package.json` files field includes `benchmark/`

### Notes
- All v0.1.x behavior preserved — `init`, `scope`, `snapshot`, `audit`, `report` unchanged
- No AI model calls, no external APIs, no telemetry
- RepoBlackbox **never** runs AI agents automatically — Agent Task Bench prepares and scores; you bring the agent

---

## [0.1.3] — 2026-05-04

### Fixed
- Standardized all README Markdown table separators to `|---|---|` for consistent GitHub rendering
- Updated Quick Start: removed stale "npm installation will be added after first npm release" text
- Removed outdated `> After npm release` note from README
- Reformatted GitHub Actions `ci.yml`: removed unnecessary quotes from `cache: npm`

### Changed
- `package.json` keywords expanded with `repo-safety`, `agentic-coding`, `ai-devtools`
- `package.json` version bumped to 0.1.3
- Quick Start restructured with cleaner Install and Development install sections

---

## [0.1.2] — 2026-05-04

### Added
- GitHub Actions CI workflow (Node 18, 20, 22)
- `examples/unsafe-agent-run/` — concrete example of scope violation caught by audit
- `docs/assets/terminal-demo.svg` — improved terminal demo for README
- `package.json` fields: `repository`, `homepage`, `bugs`

### Changed
- README: sharper opening headline and tagline
- README: added CI badge, License badge, Node badge
- README: new "What RepoBlackbox catches" table near the top
- README: added "Quick demo" code block near the top
- README: "What v0.1.x Does" converted to structured tables
- README: roadmap updated to reflect v0.1.2 as current release
- README: Documentation table includes examples link
- `package.json`: `keywords` expanded; version bumped to 0.1.2

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
