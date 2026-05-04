---
id: github-release-polish
title: GitHub Release Polish
description: Prepare an open-source repository for a clean public GitHub release.
target_agents:
  - Claude Code
  - Codex
  - Cursor
  - Copilot
required_variables:
  - project_path
  - repo_url
  - version
optional_variables:
  - release_title
  - package_manager
safety:
  - Only work inside the provided project_path.
  - Do not modify any project outside project_path.
  - Do not publish to npm, PyPI, or any package registry unless explicitly instructed.
  - Do not create a git tag or GitHub release in this task.
  - Do not call any external AI/model provider.
---

# Task: GitHub Release Polish

You are preparing this project for a public GitHub release.

- **Project path:** {{project_path}}
- **Repository:** {{repo_url}}
- **Version:** {{version}}
- **Release title:** {{release_title}}
- **Package manager:** {{package_manager}}

## Constraints

- Only work inside `{{project_path}}`.
- Do not modify unrelated projects.
- Do not publish to a package registry unless explicitly instructed.
- Do not create a git tag or GitHub release in this task.

## Steps

1. **Final checks**
   - Build the project (`npm run build` / equivalent)
   - Run typecheck if available
   - Run the test suite
   - Run any smoke test
2. **Version consistency**
   - `package.json` / `pyproject.toml` / `Cargo.toml` version is `{{version}}`
   - Lockfile is in sync
   - CLI `--version` (if applicable) reports `{{version}}`
3. **Documentation**
   - README opens with a clear one-line description
   - README install instructions are accurate (npm / PyPI / source)
   - README clone URL points to `{{repo_url}}`
   - CHANGELOG includes an entry for `{{version}}`
4. **Privacy scan**
   - grep for personal local paths
   - grep for API key patterns
   - grep for internal project references that should not be public
5. **Git status**
   - `git status` is clean or only contains intended release-polish changes
   - Review `git diff`
6. **Report**
   - Files changed
   - Validation status (build / typecheck / test / smoke)
   - Version consistency
   - Privacy scan status
   - Anything still requiring manual approval (tag, release, publish)

## Output

Produce a final report covering: files changed, validation results, version consistency, privacy scan, and any manual follow-up required.
