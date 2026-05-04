# Example: Unsafe Agent Run

This example walks through a realistic AI coding session where the agent touches a **forbidden file** and RepoBlackbox catches it.

---

## Scenario

A developer asks Claude Code to refactor the homepage hero section of a Next.js app.

The task is UI-only. The developer explicitly forbids touching `package.json`, `.env`, and auth files.

The agent refactors `Hero.tsx` correctly — but also adds a new npm dependency, which modifies `package.json` without asking.

RepoBlackbox flags this as a **HIGH** risk scope violation.

---

## Setup

```bash
# In the project root, initialize RepoBlackbox (done once)
repoblackbox init
```

---

## Step 1 — Define scope before the session

```bash
repoblackbox scope \
  --task "Refactor homepage hero to use new design tokens" \
  --allow "src/components/home/**,src/styles/tokens.css" \
  --forbid ".env,package.json,src/lib/auth/**,src/lib/billing/**" \
  --success "Hero renders correctly at all breakpoints, navigation unchanged, build passes"
```

This writes `TASK_SCOPE.md` (paste into Claude Code) and saves a machine-readable scope JSON.

Paste into Claude Code before starting:

```
Read AGENT_RULES.md and TASK_SCOPE.md before editing any code.
Only touch files listed in "Allowed Files".
Do not touch files listed in "Forbidden Files".
After finishing, list every file you changed and why.
```

---

## Step 2 — Snapshot before the agent starts

```bash
repoblackbox snapshot "before hero refactor"
```

Output:
```
✔ Branch: main  Commit: a1b2c3d4
✔ Recorded 67 files, 2 sensitive files
✔ Snapshot saved: .repoblackbox/snapshots/2025-05-03_10-00-00-before-hero-refactor.json
```

---

## Step 3 — Agent runs (Claude Code)

The agent receives the task and the TASK_SCOPE.md context. It refactors `src/components/home/Hero.tsx` and `src/styles/tokens.css`.

**But:** the agent also decides to install a new animation library, so it runs `npm install framer-motion` internally, which modifies both `package.json` and `package-lock.json` — both of which are in the forbidden list.

---

## Step 4 — Audit after the agent finishes

```bash
repoblackbox audit
```

Expected output:

```
RepoBlackbox by Catalayer
────────────────────────────────────────
audit — Comparing current state to latest snapshot

ℹ Snapshot: "before hero refactor"
ℹ Scope loaded — forbidden: 4 pattern(s), allowed: 2 pattern(s)

Changes
  Modified (3):
    ~ src/components/home/Hero.tsx
    ~ src/styles/tokens.css
    ~ package.json            ← this one is a problem

Scope Violations
⚠ Scope violation: "package.json" matches forbidden pattern

Risk Flags
⚠ Scope violation: "package.json" matches forbidden pattern
⚠ Dependency/config files changed: package.json

Risk Level:  HIGH 

⚠ HIGH risk detected — stop and manually review before continuing.
```

---

## Step 5 — Review and revert the violation

Inspect what changed in `package.json`:

```bash
git diff package.json
```

If the dependency addition was unintended:

```bash
git checkout package.json
git checkout package-lock.json
# or: npm uninstall framer-motion
```

Re-run audit to confirm clean:

```bash
repoblackbox audit
# → Risk Level: LOW (only allowed files changed)
```

---

## Step 6 — Generate the full report

```bash
repoblackbox report
```

The report (`.repoblackbox/reports/latest-report.md`) includes:

- Summary table (risk level, file counts, branch, commit)
- Active task scope
- All changed files (added, modified, deleted)
- Scope violations section
- Review checklist
- Suggested next steps

---

## Key lesson

The agent was not malicious. It made a reasonable decision: the animation library it wanted required installation. But it did not check whether `package.json` was off-limits.

**RepoBlackbox enforces the boundary that the developer declared — even when the agent forgets.**

Without RepoBlackbox, the developer might not notice the `package.json` change until CI fails or a dependency conflict surfaces in production.

---

## Files involved in this example

| File | Role |
|---|---|
| `src/components/home/Hero.tsx` | Allowed — was expected to change |
| `src/styles/tokens.css` | Allowed — was expected to change |
| `package.json` | **Forbidden** — scope violation flagged |
| `package-lock.json` | Medium risk — dependency file |

---

*See also: [docs/example-workflow.md](../../docs/example-workflow.md) | [docs/risk-model.md](../../docs/risk-model.md)*
