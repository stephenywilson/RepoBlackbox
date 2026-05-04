---
id: npm-package-release-check
title: npm Package Release Check
description: Prepare a Node/TypeScript CLI package for npm publishing, without publishing by default.
target_agents:
  - Claude Code
  - Codex
  - Cursor
required_variables:
  - project_path
  - package_name
  - version
optional_variables:
  - cli_name
  - registry_url
safety:
  - Only work inside the provided project_path.
  - Do not run npm publish unless explicitly instructed.
  - Do not log npm tokens.
  - Do not modify unrelated projects.
---

# Task: npm Package Release Check

Prepare for an npm release of:

- **Project path:** {{project_path}}
- **Package name:** {{package_name}}
- **Version:** {{version}}
- **CLI name:** {{cli_name}}
- **Registry:** {{registry_url}}

## Constraints

- Only work inside `{{project_path}}`.
- **Do not run `npm publish`** unless explicitly instructed.
- Do not log or paste npm auth tokens.
- Do not commit `.npmrc` with auth tokens.

## Steps

1. **package.json**
   - `name` = `{{package_name}}`
   - `version` = `{{version}}`
   - `bin` points to the compiled CLI entry under `dist/`
   - `files` array includes only what should ship (not `src/`, `tests/`, `node_modules/`)
   - `repository`, `homepage`, `bugs` are present and correct
2. **Build output**
   - `dist/` exists after `npm run build`
   - Compiled CLI starts with `#!/usr/bin/env node`
   - Compiled CLI is executable (`chmod +x dist/cli.js`)
3. **Lockfile**
   - `package-lock.json` version matches `{{version}}`
4. **Pack inspection**
   - Run `npm pack --dry-run`
   - Verify only intended files are included
   - Confirm `node_modules/`, `.env`, `.git/`, secrets are NOT included
5. **Smoke test**
   - Run the project's smoke test
   - Run `node dist/<cli>.js --help` and `--version`
6. **Privacy scan**
   - Run privacy scan (see `security-privacy-scan` skill)
7. **Pre-publish dry run** (do not actually publish)
   - `npm pack` to inspect the tarball
   - Check `npm whoami` if the user wants to confirm auth state

## Output

Report covering: package.json field correctness, build output status, pack contents (included + excluded), smoke test result, privacy scan result, and explicit confirmation that publish has NOT been run.
