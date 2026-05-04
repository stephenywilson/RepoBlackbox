---
id: changelog-update
title: Changelog Update
description: Update CHANGELOG and release notes for a new version.
target_agents:
  - Claude Code
  - Codex
  - Cursor
required_variables:
  - project_path
  - version
optional_variables:
  - release_date
  - release_url
  - previous_version
safety:
  - Only edit CHANGELOG.md inside the provided project_path.
  - Do not invent features that did not actually ship.
  - Do not change other files unless explicitly asked.
---

# Task: Changelog Update

Update the CHANGELOG for:

- **Project path:** {{project_path}}
- **Version:** {{version}}
- **Release date:** {{release_date}}
- **Release URL:** {{release_url}}
- **Previous version:** {{previous_version}}

## Constraints

- Only edit `CHANGELOG.md`.
- Only document changes that actually shipped — verify against git log if uncertain.
- Do not invent features.
- Preserve the existing changelog format (Keep a Changelog or otherwise).

## Steps

1. **Identify changes**
   - `git log --oneline {{previous_version}}..HEAD`
   - Group by Added / Changed / Fixed / Deprecated / Removed / Security
2. **Draft the entry**
   - Heading: `## [{{version}}] — {{release_date}}`
   - One-line summary at the top if the format supports it
   - Bullet each change with the key file/feature/component
3. **Cross-check**
   - Did each bullet correspond to a real commit?
   - Are any bullets duplicated or merged unnecessarily?
4. **Notes**
   - Mention what was intentionally NOT included (e.g., "Rollback still planned")
   - Link to release URL if `{{release_url}}` is provided
5. **Format**
   - Insert above the previous version entry
   - Keep `## [Unreleased]` section if used

## Output

Report covering: lines added, sections used (Added/Changed/Fixed/...), bullet count per section, and links inserted.
