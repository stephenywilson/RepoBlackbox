# Example Workflow

This guide shows a complete RepoBlackbox session from start to finish.

**Scenario:** You are going to ask Claude Code to refactor the homepage hero section.

---

## Step 0 — One-time setup

```bash
# In your project root (do this once per project)
repoblackbox init
```

This creates:
- `.repoblackbox/` — config, snapshots, reports, runs
- `AGENT_RULES.md` — rules to paste into your AI agent
- `PROJECT_CONTEXT.md` — describe your project for the agent
- `PROTECTED_FILES.md` — files the agent must not touch
- `TASK_SCOPE.md` — starter template for each task

Edit `AGENT_RULES.md` and `PROJECT_CONTEXT.md` once, then leave them.

---

## Step 1 — Define scope before each session

```bash
repoblackbox scope \
  --task "Refactor homepage hero section to use new design tokens" \
  --allow "src/components/home/**,src/styles/tokens.css" \
  --forbid ".env,package.json,src/lib/billing/**,src/lib/auth/**" \
  --success "Hero renders correctly at all breakpoints, navigation unchanged, build passes"
```

This writes:
- `TASK_SCOPE.md` — paste this into your AI agent
- `.repoblackbox/runs/latest-scope.json` — machine-readable, used by audit

**At minimum, always declare `--forbid`.** Even if you skip `--allow`, forbidding your secrets and critical files gives the audit something to check against.

---

## Step 2 — Snapshot before the agent starts

```bash
repoblackbox snapshot "before hero refactor"
```

This hashes every non-sensitive file. For `.env` files, only size and modification time are recorded — no content is read.

Saved to `.repoblackbox/snapshots/latest.json`.

---

## Step 3 — Give the AI agent its task

Open Claude Code (or Codex, Cursor, Copilot — your agent of choice).

Paste this into the conversation:

```
Read AGENT_RULES.md and TASK_SCOPE.md before editing any code.
Only touch files listed in the "Allowed Files" section.
Do not touch any file listed in the "Forbidden Files" section.
After finishing, list every file you changed and why.

Task: Refactor homepage hero section to use new design tokens.
```

Let the agent work.

---

## Step 4 — Audit after the agent finishes

```bash
repoblackbox audit
```

Example output:

```
RepoBlackbox by Catalayer
────────────────────────────────────────
audit — Comparing current state to latest snapshot

ℹ Snapshot: "before hero refactor" from 2025-05-03T...
ℹ Scope loaded — forbidden: 4 pattern(s), allowed: 2 pattern(s)

Changes
  Added    (1):
    + src/components/home/HeroV2.tsx
  Modified (3):
    ~ src/components/home/Hero.tsx
    ~ src/styles/tokens.css
    ~ package.json               ← this one is suspicious

Scope Violations
⚠ Scope violation: "package.json" matches forbidden pattern

Risk Level:  HIGH 

⚠ HIGH risk detected — stop and manually review before continuing.
```

The agent touched `package.json`, which you declared as forbidden. RepoBlackbox catches this immediately.

---

## Step 5 — Review the audit and decide

Options:

**If the change is unintended:**
```bash
git checkout package.json
```
Then run `repoblackbox audit` again to verify the violation is cleared.

**If the change is acceptable:**
Add a note to your task log and proceed.

**In either case:**
```bash
repoblackbox report
# → .repoblackbox/reports/latest-report.md
```

The report includes a review checklist, task scope summary, all changed files, and suggested next steps.

---

## Step 6 — Review the report

Open `.repoblackbox/reports/latest-report.md`.

It includes:
- Summary table (risk level, file counts, branch, commit)
- Task scope that was active
- Added / modified / deleted files
- Scope violations (if any)
- Out-of-scope changes (if any)
- Risk flags
- Review checklist
- Suggested next steps

Work through the checklist before committing.

---

## Full command sequence

```bash
# Setup (once)
repoblackbox init

# Before each AI session
repoblackbox scope \
  --task "Your task description" \
  --allow "src/components/target/**" \
  --forbid ".env,package.json,src/lib/billing/**" \
  --success "Describe when done"

repoblackbox snapshot "before <task-name>"

# Run AI agent here

# After AI agent finishes
repoblackbox audit
repoblackbox report

# Review .repoblackbox/reports/latest-report.md
# Then: git diff, git add, git commit
```

---

## Tips

- **Always run `scope` before `snapshot`.** The audit reads the scope JSON to check forbidden/allowed patterns.
- **Use specific `--forbid` patterns.** The more specific, the more useful the violation detection.
- **Snapshots are cheap.** Take one before every AI session, no matter how small the task.
- **Keep `AGENT_RULES.md` in your project permanently.** Paste it into every AI coding session.
- **The report is your paper trail.** Keep the reports directory if you need to audit AI coding history.

---

*See also: [risk-model.md](risk-model.md) | [ai-agent-rules.md](ai-agent-rules.md)*
