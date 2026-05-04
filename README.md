# RepoBlackbox by Catalayer

**AI coding agents move fast. Your repo needs a blackbox.**

[![CI](https://github.com/stephenywilson/RepoBlackbox/actions/workflows/ci.yml/badge.svg)](https://github.com/stephenywilson/RepoBlackbox/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](package.json)

RepoBlackbox is a lightweight **safety, evaluation, and workflow layer** for Claude Code, Codex,
Cursor, Copilot, and other AI coding agents.

It wraps each AI coding session with scope definition, a repo snapshot, a post-run audit, a review
report, local benchmark tasks, and structured workflow prompts — so you always know exactly what the
agent changed and whether it stayed within bounds.

v0.2 adds **Agent Task Bench**: local benchmark tasks for testing whether AI coding agents can
complete realistic repo-maintenance tasks without touching forbidden files.

v0.3 adds **Agent Skill Packs**: structured, reusable, copy-paste-ready workflow prompts for Claude
Code, Codex, Cursor, Copilot, and other AI coding agents.

*By [Catalayer](https://catalayer.com)*

![RepoBlackbox terminal demo](docs/assets/terminal-demo.svg)

---

## What RepoBlackbox catches

| Agent behavior | Detection |
|---|---|
| Edits package.json during a UI-only task | Scope violation and dependency risk |
| Touches .env or .env.* | Sensitive file flag, content never read |
| Modifies files outside --allow patterns | Out-of-scope warning |
| Changes auth, billing, API, or database files | Built-in HIGH risk |
| Deletes many files | Bulk deletion warning |
| Only edits declared allowed files | LOW risk |

---

## Quick Start

RepoBlackbox is not yet published on npm. Install from source:

```bash
git clone https://github.com/stephenywilson/RepoBlackbox
cd RepoBlackbox
npm install
npm run build
npm link
repoblackbox --help
```

> npm installation will be available after the first npm release.

---

## Core Workflow

```bash
# Initialize once per project
repoblackbox init

# Before each AI session, define scope
repoblackbox scope \
  --task "Refactor homepage hero" \
  --allow "src/components/home/**,src/styles/tokens.css" \
  --forbid ".env,package.json,src/lib/auth/**"

# Snapshot before the agent starts
repoblackbox snapshot "before claude task"

# Run Claude Code, Codex, or Cursor

# Audit what changed
repoblackbox audit

# Generate a review report
repoblackbox report
```

---

## Agent Task Bench

RepoBlackbox v0.2 added local benchmark tasks for evaluating whether AI coding agents can complete
realistic repo-maintenance tasks safely without touching forbidden files.

```bash
repoblackbox bench list
repoblackbox bench prepare readme-url-fix
# run your AI coding agent inside the prepared workspace
repoblackbox bench score readme-url-fix
repoblackbox bench report readme-url-fix
repoblackbox bench demo
```

Built-in tasks:

| Task | What it tests |
|---|---|
| readme-url-fix | Fix a wrong clone URL without touching forbidden files |
| package-version-sync | Sync CLI version output with package metadata |
| docs-toc-update | Add a missing README Table of Contents entry |
| security-cleanup | Remove unsafe-looking docs examples |
| forbidden-file-guard | Make a docs-only change without touching package, src, or env files |

Key properties:

- RepoBlackbox does not run AI agents automatically.
- Scoring is deterministic and runs on the local filesystem. No API keys required.
- bench demo is fully self-contained and requires no AI agent.

See [docs/agent-task-bench.md](https://github.com/stephenywilson/RepoBlackbox/blob/main/docs/agent-task-bench.md)
for the full reference.

---

## Agent Skill Packs

RepoBlackbox v0.3 added structured, reusable, copy-paste-ready workflow prompts for Claude Code,
Codex, Cursor, Copilot, and other AI coding agents.

```bash
repoblackbox skill list

repoblackbox skill show readme-audit

repoblackbox skill use github-release-polish \
  --var project_path=/path/to/repo \
  --var repo_url=https://github.com/user/repo \
  --var version=0.3.0

repoblackbox skill use readme-audit \
  --var project_path=/path/to/repo \
  --output .repoblackbox/skills/readme-audit.md
```

Built-in skills:

| Skill | Purpose |
|---|---|
| github-release-polish | Prepare an open-source repo for a GitHub release |
| readme-audit | Audit README clarity, install accuracy, and copy-paste correctness |
| repo-url-fix | Fix wrong repository URLs after a rename or ownership change |
| security-privacy-scan | Scan for private paths, API keys, and internal references |
| npm-package-release-check | Prepare a Node or TypeScript CLI for npm publishing without publishing |
| python-package-release-check | Prepare a Python CLI for PyPI release without publishing |
| cli-smoke-test | Add or improve CLI smoke tests |
| changelog-update | Update CHANGELOG for a new version |
| ui-screenshot-audit | Generate targeted polish from UI screenshots |
| agent-safe-refactor | Guide a constrained refactor with explicit boundaries |

Key properties:

- skill use renders a prompt and prints or writes it. It does not execute the prompt.
- No API keys required. No model providers are called.
- Skills are local Markdown templates with variable substitution.
- Paste the rendered output into Claude Code, Codex, or Cursor yourself.

See [docs/agent-skill-packs.md](https://github.com/stephenywilson/RepoBlackbox/blob/main/docs/agent-skill-packs.md)
for the full reference.

---

## Commands

| Command | What it does |
|---|---|
| repoblackbox init | Create config and agent safety documents |
| repoblackbox scope | Define task boundaries with allow and forbid patterns |
| repoblackbox snapshot | Capture repo state before AI edits |
| repoblackbox audit | Compare current state against snapshot |
| repoblackbox report | Generate Markdown review report |
| repoblackbox bench list | List built-in benchmark tasks |
| repoblackbox bench prepare | Prepare a benchmark workspace |
| repoblackbox bench score | Score a completed benchmark task |
| repoblackbox bench report | Generate a benchmark report |
| repoblackbox bench demo | Run a self-contained bench demo |
| repoblackbox skill list | List built-in skill packs |
| repoblackbox skill show | Show skill metadata and preview |
| repoblackbox skill use | Render a skill prompt with variables |

---

## Important Clarifications

**RepoBlackbox does not run AI agents automatically.**
It prepares workspaces, renders prompts, audits diffs, and generates reports.
You run the AI agent yourself.

**RepoBlackbox does not call external model providers.**
No API keys are required anywhere.

**RepoBlackbox does not read .env file contents.**
For .env and .env.* files, RepoBlackbox records only whether the file exists, its size, and its
modification time. It never reads or hashes the file content. This is by design.

**RepoBlackbox is not a security scanner.**
It does not scan for secrets, vulnerabilities, or malicious code. It tells you what the agent
changed, what was forbidden, and what needs human review.

**RepoBlackbox does not perform rollback yet.**
Safe rollback is planned for a future release. Automated rollback done poorly can cause data loss,
so current versions focus on scope, snapshot, audit, report, bench, and skill workflows.
Use git checkout -- path/to/file or git reset manually after reviewing the audit.

---

## What Gets Protected

By default, RepoBlackbox flags changes to:

| Category | Files |
|---|---|
| Secrets | .env, .env.* |
| Dependencies | package.json, lock files |
| Deployment | Dockerfile, vercel.json, netlify.toml |
| CI/CD | .github/workflows/**, .travis.yml |
| Auth | src/lib/auth/** |
| Billing | src/lib/billing/**, src/lib/stripe/** |
| API routes | app/api/**, pages/api/**, src/api/** |
| Database | prisma/**, migrations/**, database/** |
| Config | src/config/** |

You can customize the protected list in .repoblackbox/protected-files.json.

---

## Risk Levels

| Level | Meaning |
|---|---|
| LOW | Only allowed, normal files changed |
| MEDIUM | Dependency, package, config, or out-of-scope files changed |
| HIGH | Env, auth, billing, API, deployment, database, bulk deletion, or forbid-pattern match |

---

## RepoBlackbox Version Line

- v0.1: Safety workflow with scope, snapshot, audit, and report
- v0.2: Agent Task Bench
- v0.3: Agent Skill Packs

Current version: v0.3.0

---

## Roadmap

Planned for future releases:

- Safe rollback workflow
- GitHub PR comment support
- CI gate mode
- Custom user skill directories
- Team policy files
- Optional HTML reports
- MCP integration exploration

---

## Documentation

| Doc | Description |
|---|---|
| docs/example-workflow.md | Full step-by-step workflow |
| docs/risk-model.md | Risk model and LOW / MEDIUM / HIGH rules |
| docs/ai-agent-rules.md | Agent rule files and task scope workflow |
| docs/agent-task-bench.md | Agent Task Bench task format and scoring |
| docs/agent-skill-packs.md | Skill Pack format, variables, and built-in skills |
| CHANGELOG.md | Version history |
| CONTRIBUTING.md | Setup, build, smoke test, and contribution guidelines |
| SECURITY.md | What RepoBlackbox does and does not do with files |

---

## License

Apache 2.0 — free to use, modify, and build upon.

© 2024-2026 Catalayer AI

---

*RepoBlackbox was built from real AI coding experience at Catalayer.*
*It is not just a template — it is a workflow.*
