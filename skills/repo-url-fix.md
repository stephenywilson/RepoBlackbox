---
id: repo-url-fix
title: Repository URL Fix
description: Find and fix wrong repository URLs after a repo rename or ownership change.
target_agents:
  - Claude Code
  - Codex
  - Cursor
required_variables:
  - project_path
  - old_repo_url
  - new_repo_url
optional_variables:
  - old_owner
  - new_owner
safety:
  - Only edit files inside the provided project_path.
  - Do not modify unrelated text on the same line.
  - Do not change source code logic.
---

# Task: Fix Repository URLs

A repo was renamed or ownership changed. Update all references.

- **Project path:** {{project_path}}
- **Old URL:** {{old_repo_url}}
- **New URL:** {{new_repo_url}}
- **Old owner:** {{old_owner}}
- **New owner:** {{new_owner}}

## Constraints

- Only edit files inside `{{project_path}}`.
- Do not change source code logic.
- Do not edit text unrelated to the URL change.
- Preserve the URL casing the new repo uses.

## Steps

1. **Scan for references**
   - `README.md`
   - All files under `docs/`
   - `package.json`, `pyproject.toml`, `Cargo.toml`, etc.
   - `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`
   - GitHub workflows under `.github/`
2. **Replace**
   - `{{old_repo_url}}` → `{{new_repo_url}}`
   - Any `git clone` example
   - Any `https://github.com/{{old_owner}}/...` link
3. **Verify**
   - `git clone {{new_repo_url}}` would succeed (path casing)
   - `package.json` `repository`, `homepage`, `bugs.url` match the new URL
4. **Run checks**
   - Build (if available)
   - Smoke test (if available)
5. **Commit**
   - Suggested message: `Fix repository URLs after rename`

## Output

Report files changed, links replaced, and any references that were intentionally left alone.
