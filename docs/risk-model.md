# Risk Model

RepoBlackbox assigns one of three risk levels to each audit: **LOW**, **MEDIUM**, or **HIGH**.

This document explains how the risk level is determined and what it means.

---

## Risk Levels

### LOW

No risky files were changed. Only normal source files that are not in any protected category.

**Suggested action:** Review the diff (`git diff`), run your build and tests, then commit if everything looks good.

### MEDIUM

One or more of the following:
- `package.json` was changed
- Lock files (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`) were changed
- Build config files (`tsconfig.json`, `vite.config.*`, `next.config.*`, etc.) were changed
- More than 3 files were deleted
- Files were changed outside the declared `--allow` patterns (out-of-scope)

**Suggested action:** Inspect each MEDIUM-risk change carefully. Confirm dependency changes are intentional. Run `npm install` if lock files changed. Run full tests.

### HIGH

One or more of the following:
- A file matching a `--forbid` pattern was changed (**scope violation**)
- `.env`, `.env.*` were modified (sensitive file)
- Auth, billing, payment, or stripe files were changed
- API route files were changed
- Database, Prisma, or migration files were changed
- Deployment files (`Dockerfile`, `docker-compose.yml`, `vercel.json`, `netlify.toml`) were changed
- CI/CD files (`.github/workflows/**`) were changed
- More than 10 files were deleted
- Git diff shows more than 500 lines added/deleted

**Suggested action:** Stop. Do not continue until you have manually reviewed every HIGH-risk change. Consider reverting unintended changes with `git checkout <file>`. Run your full test suite before merging.

---

## Built-in Protected File Categories

These file patterns are always checked regardless of `--forbid`:

| Category | Patterns |
|---|---|
| Env / secrets | `.env`, `.env.*` |
| Dependencies | `package.json`, lock files |
| Build config | `tsconfig*.json`, `vite.config.*`, `next.config.*`, etc. |
| Auth | `src/lib/auth/**` |
| Billing / payments | `src/lib/billing/**`, `src/lib/stripe/**` |
| API routes | `src/api/**`, `app/api/**`, `pages/api/**` |
| Database | `database/**`, `prisma/**`, `migrations/**` |
| Config | `src/config/**` |
| Deployment | `Dockerfile`, `docker-compose.yml`, `vercel.json`, `netlify.toml` |
| CI/CD | `.github/workflows/**`, `.circleci/**`, `.travis.yml` |

---

## Scope Violations

When you run `repoblackbox scope --forbid "..."`, the forbidden patterns are saved to `.repoblackbox/runs/latest-scope.json`.

During audit, every changed file (added, modified, or deleted) is checked against these patterns. If a match is found:
- The file is reported as a **scope violation**
- The risk level is immediately escalated to **HIGH**

Example:
```bash
repoblackbox scope --forbid "package.json,.env,src/lib/billing/**"
# → later, if the agent modifies package.json:
repoblackbox audit
# → Scope violation: "package.json" matches forbidden pattern
# → Risk Level: HIGH
```

---

## Out-of-Scope Warnings

When you run `repoblackbox scope --allow "..."`, the allowed patterns are saved to the same JSON file.

During audit, changed files that do **not** match any allowed pattern (and are not already flagged as scope violations) are reported as **out-of-scope**.

Out-of-scope changes are **MEDIUM** risk by default, unless the file also matches a built-in HIGH-risk category.

Example:
```bash
repoblackbox scope --allow "src/components/Hero.tsx"
# → agent also modifies src/components/Footer.tsx
repoblackbox audit
# → "src/components/Footer.tsx" is outside declared allowed patterns
# → Risk Level: MEDIUM (at minimum)
```

Out-of-scope detection is optional. If you do not declare `--allow`, no out-of-scope warnings are generated.

---

## Why Audit Always Exits 0

In v0.1.1, `repoblackbox audit` always exits with code 0, even for HIGH risk.

This is intentional. In v0.1.1, audit is an informational tool for developer review — not a gate. Automatically failing CI pipelines based on v0.1.1 risk levels is not recommended because the model is still being refined.

CI mode with configurable exit codes is planned for **v0.2**.

---

## Sensitive Files

Files matching `.env` and `.env.*` are treated as **sensitive**. RepoBlackbox:
- Never reads their content
- Never hashes their content
- Only records: exists (true/false), size, and modification time

If the size or modification time changes between snapshot and audit, the file is flagged as potentially modified.

This design is permanent — RepoBlackbox will never read `.env` content.

---

*See also: [example-workflow.md](example-workflow.md) | [ai-agent-rules.md](ai-agent-rules.md)*
