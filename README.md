# RepoBlackbox by Catalayer

**AI coding agents move fast. Your repo needs a blackbox.**

RepoBlackbox is a lightweight safety layer for Claude Code, Codex, Cursor, Copilot, and other AI coding agents.

Before the agent edits your repo, define the task scope and capture a snapshot.  
After the agent edits your repo, audit what changed and generate a review report.

---

## What is RepoBlackbox?

RepoBlackbox is a CLI developer tool that wraps your AI coding workflow with a structured safety protocol:

1. **Scope** — define what the agent is allowed to touch before it starts
2. **Snapshot** — capture the exact state of your repo before any changes
3. **Audit** — compare after the agent finishes, flag risky edits
4. **Report** — generate a clean Markdown review you can share or file

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

RepoBlackbox is currently available from source. npm installation will be added after the first npm release.

### Install from source

```bash
git clone https://github.com/stephenywilson/RepoBlackbox
cd RepoBlackbox
npm install
npm run build
npm link
repoblackbox --help
```

### Use in your project

```bash
cd /path/to/your/project

repoblackbox init

repoblackbox scope \
  --task "Refactor homepage hero" \
  --allow "src/components/home/**,src/styles/theme.css,src/styles/tokens.css" \
  --forbid ".env,package.json,src/lib/auth/**" \
  --success "Hero renders correctly, navigation unchanged, build passes"

repoblackbox snapshot "before claude task"

# Run Claude Code / Codex / Cursor

repoblackbox audit
repoblackbox report
```

> After npm release: `npm install -g repoblackbox`

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
| --- | --- |
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
| --- | --- |
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
| --- | --- |
| `LOW` | Only allowed, normal files changed |
| `MEDIUM` | Dependency, package, or config files changed |
| `HIGH` | Env, auth, billing, API, deployment, or database files touched — or many files deleted — or any file matches a `--forbid` pattern |

---

## What v0.1 Does

- `init` — create config and safety documents
- `scope` — define task boundaries (interactive or flag-based); saves machine-readable JSON for audit
- `snapshot` — SHA-256 hash-based repo state capture; sensitive files never read
- `audit` — diff vs snapshot, classify risk, detect scope violations and out-of-scope changes
- `report` — Markdown AI coding run report with scope violations, review checklist, and next steps

What v0.1 does **not** do:

- No rollback (planned for v0.2 — rollback done poorly causes data loss)
- No GitHub PR integration (v0.2)
- No CI mode / exit codes (v0.2)
- No web UI (v0.3)
- Does not read `.env` file content (by design — forever)

---

## Roadmap

### v0.1.1 (current)
- `init`, `scope`, `snapshot`, `audit`, `report`
- SHA-256 file hash comparison
- Risk level classification: LOW / MEDIUM / HIGH
- Custom forbidden pattern matching (`--forbid`) with scope violation detection
- Out-of-scope change warnings when `--allow` is declared
- Markdown and JSON reports
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
| [docs/example-workflow.md](docs/example-workflow.md) | Full step-by-step workflow with real command output |
| [docs/risk-model.md](docs/risk-model.md) | How LOW / MEDIUM / HIGH are determined, scope violations, out-of-scope |
| [docs/ai-agent-rules.md](docs/ai-agent-rules.md) | How the four safety documents work, Claude Code / Cursor / Codex integration |
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
