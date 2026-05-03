# Contributing to RepoBlackbox

Thank you for your interest in contributing to RepoBlackbox.

RepoBlackbox is a lightweight CLI safety layer for AI coding agents. Contributions that keep it focused, minimal, and reliable are welcome.

---

## Local Setup

**Requirements:** Node.js >= 18

```bash
git clone https://github.com/stephenywilson/RepoBlackbox
cd RepoBlackbox
npm install
npm run build
```

Link the CLI globally for local testing:

```bash
npm link
repoblackbox --help
```

---

## Development

```bash
npm run build       # compile TypeScript → dist/
npm run typecheck   # type-check without emitting
npm run dev         # watch mode
npm run smoke       # full end-to-end smoke test
```

The smoke test creates a temporary project in `/tmp`, runs all five commands, and verifies correctness. It does not touch any real project. Run it before opening a PR.

---

## Project Structure

```
src/
  cli.ts              — commander entry point
  commands/           — one file per CLI command
    init.ts
    scope.ts
    snapshot.ts
    audit.ts
    report.ts
  utils/              — shared utilities
    fs.ts             — file system helpers
    git.ts            — git info via child_process
    hash.ts           — SHA-256 file hashing
    paths.ts          — path constants and ignore/sensitive logic
    pattern.ts        — glob-like pattern matcher (zero dependencies)
    render.ts         — chalk-based terminal output
    risk.ts           — risk classification logic
    time.ts           — timestamps and slugs

templates/            — files copied into user projects by `init`
scripts/              — smoke-test.sh
docs/                 — documentation
```

---

## Contribution Guidelines

**Welcome:**
- Bug fixes
- Improved pattern matching
- Better risk classification
- New file templates
- Documentation improvements
- Smoke test improvements
- Test coverage

**Please discuss first (open an issue):**
- New CLI commands
- Changes to existing command flags
- Changes to the snapshot or audit JSON schema
- Any feature that increases required dependencies

**Not accepted:**
- Web UI or server components (v0.x is CLI-only)
- Features that require reading `.env` file content
- Rollback functionality (reserved for v0.2, needs careful design)
- Features that introduce paid APIs or external services

---

## Coding Standards

- TypeScript strict mode
- CommonJS compilation (no ESM)
- No new runtime dependencies without discussion
- Keep utilities small and focused
- Keep commands independent — no cross-command state except via `.repoblackbox/` files

---

## Opening Issues

Use [GitHub Issues](https://github.com/stephenywilson/RepoBlackbox/issues) for:
- Bug reports (include OS, Node version, command run, and output)
- Feature requests (describe the AI coding workflow problem it solves)
- Documentation gaps

---

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 license.
