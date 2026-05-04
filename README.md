# RepoBlackbox

**Stop AI coding agents from breaking your repo.**

[![CI](https://github.com/stephenywilson/RepoBlackbox/actions/workflows/ci.yml/badge.svg)](https://github.com/stephenywilson/RepoBlackbox/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](package.json)

RepoBlackbox is a lightweight CLI safety layer for Claude Code, Codex, Cursor, Copilot, and other AI coding agents. It wraps each AI coding session with scope definition, a repo snapshot, a post-run audit, and a Markdown report — so you always know exactly what the agent changed and whether it stayed within bounds.

It does not replace Git. It adds an AI-agent-specific workflow on top of Git so you catch scope violations and risky edits before you commit.

*By [Catalayer](https://catalayer.com)*

![RepoBlackbox terminal demo](docs/assets/terminal-demo.svg)

---

## What RepoBlackbox catches

| Agent behavior | Detection |
|---|---|
| Edits `package.json` during a UI-only task | Scope violation → **HIGH** |
| Touches `.env` or `.env.*` | Sensitive file flag → **HIGH** (content never read) |
| Modifies files outside `--allow` patterns | Out-of-scope warning → **MEDIUM** |
| Changes auth, billing, API, or database files | Built-in HIGH risk |
| Deletes more than 10 files | Bulk deletion warning → **HIGH** |
| Only edits declared allowed files | **LOW** |

---

## Quick demo

```bash
# 1. Define scope — what the agent may and may not touch
repoblackbox scope \
  --task "Refactor homepage hero" \
  --allow "src/components/home/**,src/styles/tokens.css" \
  --forbid ".env,package.json,src/lib/auth/**"

# 2. Snapshot before the agent starts
repoblackbox snapshot "before claude task"

# 3. Run Claude Code / Codex / Cursor — then audit
repoblackbox audit    # flags scope violations and risk level
repoblackbox report   # saves .repoblackbox/reports/latest-report.md
```

---

## What is RepoBlackbox?

RepoBlackbox is a CLI developer tool that wraps your AI coding workflow with a structured safety protocol:

1. **Scope** — define what the agent is allowed to touch before it starts
2. **Snapshot** — capture the exact state of your repo before any changes
3. **Audit** — compare after the agent finishes, flag risky edits and scope violations
4. **Report** — generate a clean Markdown review you can share, file, or commit

It does not interfere with your AI agent's capabilities. It adds the discipline that production development requires.

---

## Why I Built This

I built RepoBlackbox after using Claude Code, Codex, Cursor, and other AI coding agents heavily across multiple real projects — including [Catalayer](https://catalayer.com), Chrome extensions, API services, and internal AI tools.

AI agents are powerful. They can write, refactor, and debug faster than any developer working alone. But working at production scale, I kept hitting the same problems:

**AI coding agents often:**

- Edit files outside the requested scope
- Rewrite unrelated modules while "fixing" something small
- Touch `package.json`, lock files, or config files without asking
- Modify `.env` or deployment files accidentally
- Delete existing functionality while solving a narrow task
- Break the existing design system or component structure
- Make it hard to understand what changed after multiple rounds of iteration

At Catalayer, we needed a simple rule:

> Before an AI agent changes the codebase, it should know the boundaries.  
> After it changes the codebase, we should know exactly what happened.

RepoBlackbox is the workflow built around that idea.

---

## The Problem with AI Coding Agents

AI coding agents do not understand "production anxiety." They do not instinctively know that your `.env` file should never be touched, that your billing library has zero tolerance for accidental edits, or that the design system took months to stabilize.

Without boundaries, even a well-intentioned agent can cause cascading damage. Not because it is bad — but because no one told it what was off-limits.

**RepoBlackbox enforces that conversation before the work begins.**

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│  Developer defines task scope                           │
│  repoblackbox scope --task "Refactor hero section"      │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│  Snapshot captured before AI edits                      │
│  repoblackbox snapshot "before hero refactor"           │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│  AI agent edits code                                    │
│  (Claude Code / Codex / Cursor / Copilot)               │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│  Audit: compare current state vs snapshot               │
│  repoblackbox audit                                     │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│  Report: generate human-readable Markdown review        │
│  repoblackbox report                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Install

```bash
npm install -g repoblackbox
```

### Use in your project

```bash
cd /path/to/your/project

repoblackbox init

repoblackbox scope \
  --task "Refactor homepage hero" \
  --allow "src/components/home/**,src/styles/tokens.css" \
  --forbid ".env,package.json,src/lib/auth/**"

repoblackbox snapshot "before claude task"

# Run Claude Code / Codex / Cursor

repoblackbox audit
repoblackbox report
```

### Development install

To build and run RepoBlackbox from source:

```bash
git clone https://github.com/stephenywilson/RepoBlackbox
cd RepoBlackbox
npm install && npm run build && npm link
repoblackbox --help
```

---

## Commands

### `repoblackbox init`

Creates the RepoBlackbox config and safety documents in your project.

```bash
repoblackbox init
repoblackbox init --force   # overwrite existing files
```

Creates:
```
.repoblackbox/
  config.json
  protected-files.json
  snapshots/
  reports/
  runs/

AGENT_RULES.md        ← paste into your AI agent
PROJECT_CONTEXT.md    ← describe your project
PROTECTED_FILES.md    ← files the agent must not touch
TASK_SCOPE.md         ← define each task before starting
```

---

### `repoblackbox scope`

Defines task boundaries before each AI coding session.

```bash
# Interactive mode
repoblackbox scope

# Flag mode
repoblackbox scope \
  --task "Refactor homepage hero" \
  --allow "src/pages/index.tsx,src/components/home/**" \
  --forbid ".env,package.json,src/lib/billing/**" \
  --success "Hero improved, navigation unchanged, build passes"
```

Writes `TASK_SCOPE.md` — paste this into Claude Code / Codex / Cursor before starting.

---

### `repoblackbox snapshot "label"`

Captures the exact state of your repo before an AI agent starts working.

```bash
repoblackbox snapshot "before hero refactor"
repoblackbox snapshot "before auth refactor"
```

Records file hashes for all non-sensitive files. For `.env` and similar files, records only existence, size, and modification time — never reads content.

Saves to `.repoblackbox/snapshots/`.

---

### `repoblackbox audit`

Compares the current repo state against the latest snapshot.

```bash
repoblackbox audit
```

Detects:
- Added files
- Modified files
- Deleted files
- Sensitive files touched (`.env`, `.env.*`)
- Scope violations — files matching `--forbid` patterns
- Out-of-scope changes — files outside `--allow` patterns
- Built-in protection for auth, billing, API, deployment files
- Large change warnings

Assigns a risk level: `LOW`, `MEDIUM`, or `HIGH`.

Saves audit report to `.repoblackbox/reports/`.

---

### `repoblackbox report`

Generates a full human-readable AI coding run report in Markdown.

```bash
repoblackbox report
```

Report includes:
- Summary table
- Task scope
- Changed files
- Risk flags
- Review checklist
- Suggested next steps based on risk level

Saves to `.repoblackbox/reports/latest-report.md`.

---

## Concrete Example: Homepage Hero Refactor

```bash
# Step 1 — Define scope before opening the AI agent
repoblackbox scope \
  --task "Refactor homepage hero section to use new design tokens" \
  --allow "src/components/home/**,src/styles/tokens.css" \
  --forbid ".env,package.json,src/lib/billing/**,src/lib/auth/**" \
  --success "Hero renders correctly, navigation unchanged, build passes"

# Step 2 — Snapshot the repo before any changes
repoblackbox snapshot "before claude homepage task"

# Step 3 — Open Claude Code / Codex / Cursor
# Paste TASK_SCOPE.md into the conversation, then give your instruction.
# The agent now knows what it is and is not allowed to touch.

# Step 4 — After the agent finishes, audit what changed
repoblackbox audit
# Output example:
#   Added    (1): src/components/home/Hero.v2.tsx
#   Modified (2): src/components/home/Hero.tsx, src/styles/tokens.css
#   Modified (1): package.json  ← ⚠ Scope violation: matches forbidden pattern
#   Risk Level: HIGH

# Step 5 — Generate the full review report
repoblackbox report
# → .repoblackbox/reports/latest-report.md
# → Includes: summary, task scope, changed files, scope violations, review checklist
```

**What the audit catches automatically:**

| Change | Detection |
|---|---|
| File matches `--forbid` pattern | Scope violation → **HIGH** |
| File outside `--allow` patterns | Out-of-scope warning → **MEDIUM** |
| `package.json` / lock files changed | Dependency flag → **MEDIUM** |
| `.env` modified | Sensitive file flag → **HIGH** |
| Auth / billing / API files changed | Built-in HIGH risk |
| More than 10 files deleted | Bulk deletion warning |

**Paste into Claude Code before starting:**

```
Read AGENT_RULES.md and TASK_SCOPE.md before editing any code.
Only touch files listed in the "Allowed Files" section.
Do not touch any file in the "Forbidden" section.
After finishing, list every file you changed and why.
```

---

## Important Clarifications

**RepoBlackbox does not perform rollback.**  
Rollback is planned for v0.2. Automated rollback done poorly can cause data loss. In v0.1, use `git checkout <file>` or `git reset` manually after reviewing the audit.

**RepoBlackbox does not read `.env` file content.**  
For sensitive files like `.env` and `.env.*`, RepoBlackbox records only: whether the file exists, its size, and its modification time. It never reads or hashes the content. This is by design.

**RepoBlackbox is not a security scanner.**  
It does not scan for secrets, vulnerabilities, or malicious code. It is a workflow safety layer: it tells you what changed, what was forbidden, and what needs human review.

**RepoBlackbox does not slow down your AI coding.**  
The entire workflow — scope, snapshot, audit, report — takes under 10 seconds for most projects. The cost of skipping it is measured in debugging time and broken builds.

---

## What Gets Protected

By default, RepoBlackbox flags changes to:

| Category | Files |
|---|---|
| Secrets | `.env`, `.env.*` |
| Dependencies | `package.json`, lock files |
| Deployment | `Dockerfile`, `vercel.json`, `netlify.toml` |
| CI/CD | `.github/workflows/**`, `.travis.yml` |
| Auth | `src/lib/auth/**` |
| Billing | `src/lib/billing/**`, `src/lib/stripe/**` |
| API routes | `app/api/**`, `pages/api/**`, `src/api/**` |
| Database | `prisma/**`, `migrations/**`, `database/**` |
| Config | `src/config/**` |

You can customize the protected list in `.repoblackbox/protected-files.json`.

---

## Risk Levels

| Level | Meaning |
|---|---|
| `LOW` | Only allowed, normal files changed |
| `MEDIUM` | Dependency, package, or config files changed |
| `HIGH` | Env, auth, billing, API, deployment, or database files touched — or many files deleted — or any file matches a `--forbid` pattern |

---

## What v0.1.x Does

| Command | What it does |
|---|---|
| `repoblackbox init` | Create `.repoblackbox/` config and four agent safety documents |
| `repoblackbox scope` | Define task boundaries (interactive or `--allow`/`--forbid` flags); saves JSON for audit |
| `repoblackbox snapshot` | SHA-256 hash every non-sensitive file; record `.env` metadata without reading content |
| `repoblackbox audit` | Diff current state vs snapshot; detect scope violations, out-of-scope changes, risk level |
| `repoblackbox report` | Write Markdown review report with scope violations, checklist, and suggested next steps |

**v0.1.x does not do:**

| Feature | Status |
|---|---|
| Rollback | Planned v0.2 (safe rollback is non-trivial) |
| GitHub PR comments | Planned v0.2 |
| CI exit-code gate | Planned v0.2 |
| Read `.env` content | Never — by design |

---

## Roadmap

### v0.1.2 (current)
- `init`, `scope`, `snapshot`, `audit`, `report`
- SHA-256 file hash comparison
- Risk level classification: LOW / MEDIUM / HIGH
- Forbidden pattern matching (`--forbid`) with scope violation detection → HIGH
- Out-of-scope change warnings when `--allow` is declared → MEDIUM
- Markdown and JSON audit reports
- GitHub Actions CI across Node 18 / 20 / 22
- Smoke test suite

### v0.2
- Safer rollback workflow
- GitHub PR comment support
- CI mode (exit code based on risk level)
- Stricter protected-file policy
- Project presets (Next.js, Remix, SvelteKit, etc.)

### v0.3
- Claude Code / Cursor / Codex workflow presets
- MCP integration exploration
- Team policy files
- HTML report output

---

## Philosophy

AI coding should be fast. But production code needs boundaries.

Most developers using AI agents do not have a systematic way to answer: *"what exactly did the agent change, and was it safe?"*

RepoBlackbox is not about slowing down AI coding. It is about making sure you know what happened — before you push.

The snapshot is your pre-flight check.  
The audit is your landing check.  
The report is your flight log.

---

## Documentation

| Doc | Description |
|---|---|
| [docs/example-workflow.md](https://github.com/stephenywilson/RepoBlackbox/blob/main/docs/example-workflow.md) | Full step-by-step workflow with real command output |
| [docs/risk-model.md](https://github.com/stephenywilson/RepoBlackbox/blob/main/docs/risk-model.md) | How LOW / MEDIUM / HIGH are determined, scope violations, out-of-scope |
| [docs/ai-agent-rules.md](https://github.com/stephenywilson/RepoBlackbox/blob/main/docs/ai-agent-rules.md) | How the four safety documents work, Claude Code / Cursor / Codex integration |
| [examples/unsafe-agent-run/](examples/unsafe-agent-run/README.md) | End-to-end example: agent touches forbidden file, audit flags HIGH |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Setup, build, smoke test, contribution guidelines |
| [SECURITY.md](SECURITY.md) | What RepoBlackbox does and does not do with your files |

---

## License

Apache 2.0 — free to use, modify, and build upon.

© 2024-2026 Catalayer AI

---

*RepoBlackbox was built from real AI coding experience at Catalayer.*  
*It is not just a template — it is a workflow.*
