# GitHub Release Metadata

Suggested content for the initial GitHub repository setup and first release.

---

## Repository Settings

**Repository name:**
```
repoblackbox
```

**Repository description:**
```
A lightweight safety layer for Claude Code, Codex, Cursor and AI coding agents.
```

**Website:** *(leave blank or add docs link when available)*

**Topics:**
```
ai-coding
ai-agent
claude-code
codex
cursor
developer-tools
cli
typescript
code-review
workflow
repo-safety
```

---

## .gitignore Reminder

The `.gitignore` in this repo already excludes `node_modules/` and `dist/`. When users add RepoBlackbox to their own projects, they should add `.repoblackbox/` to their own `.gitignore` if they do not want to commit snapshots and reports:

```
# Add to your project's .gitignore
.repoblackbox/
```

---

## Initial Release

**Tag:** `v0.1.1`

**Release title:**
```
RepoBlackbox v0.1.1 — AI Coding Agent Safety Workflow
```

**Release notes:**

---

**RepoBlackbox** is a lightweight CLI safety layer for Claude Code, Codex, Cursor, Copilot, and other AI coding agents.

### What it does

Before the agent edits your repo, define the task scope and capture a snapshot.  
After the agent edits your repo, audit what changed and generate a review report.

### Commands

- `repoblackbox init` — create safety documents in your project
- `repoblackbox scope` — define task boundaries with `--allow` and `--forbid` patterns
- `repoblackbox snapshot "label"` — capture repo state before agent work
- `repoblackbox audit` — diff current state vs snapshot, detect scope violations
- `repoblackbox report` — generate Markdown review report

### v0.1.1 highlights

- Forbidden pattern matching: files touching `--forbid` patterns are flagged as **HIGH** risk scope violations
- Out-of-scope warnings: files changed outside `--allow` patterns flagged as **MEDIUM** risk
- `.env` content is never read — only existence, size, and modification time are recorded
- Rollback is intentionally absent — deferred to v0.2 where it can be done safely
- Full end-to-end smoke test suite

### Install (local)

```bash
git clone https://github.com/stephenywilson/RepoBlackbox
cd RepoBlackbox
npm install && npm run build && npm link
repoblackbox --help
```

### Requirements

- Node.js >= 18

### License

Apache 2.0 — free to use, modify, and build upon.

---

## npm Publish Checklist (when ready)

Before publishing to npm:

1. `npm run build` passes cleanly
2. `npm run smoke` all tests pass
3. `package.json` version is correct
4. `package.json` `files` field lists only `dist`, `templates`, `LICENSE`, `README.md`
5. No private paths or secrets in any committed file
6. `npm pack --dry-run` to inspect what will be published
7. `npm publish` (requires npm account with publish rights)

**Do not publish until all above are verified.**
