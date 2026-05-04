---
id: readme-audit
title: README Audit
description: Audit a GitHub README for clarity, install accuracy, and copy-paste correctness.
target_agents:
  - Claude Code
  - Codex
  - Cursor
required_variables:
  - project_path
  - repo_url
optional_variables:
  - package_name
  - package_manager
safety:
  - Only edit README.md inside the provided project_path.
  - Do not modify source code.
  - Do not change project positioning unless explicitly asked.
  - Do not modify package metadata unless explicitly asked.
---

# Task: README Audit

You are auditing the README of:

- **Project path:** {{project_path}}
- **Repository:** {{repo_url}}
- **Package name:** {{package_name}}
- **Package manager:** {{package_manager}}

## Constraints

- Only edit `README.md`.
- Do not change source code.
- Do not modify package metadata.
- Preserve the project's existing positioning.

## Steps

1. **Install instructions**
   - Are the install commands actually runnable?
   - Does `npm install -g {{package_name}}` (or `pip install {{package_name}}`) work today, or is the package not yet published?
   - If unpublished, prefer source install as primary and add a note.
2. **Clone URL**
   - Does the clone command point to `{{repo_url}}`?
   - Are there stale repository names or owner names?
3. **Table of contents**
   - Does every TOC entry resolve to a real section?
   - Are there sections in the body missing from the TOC?
4. **Images and assets**
   - Do all relative image paths resolve?
   - Will images render on GitHub and on npmjs.com / PyPI?
5. **Disclaimers**
   - Does the README clearly state what the project does NOT do?
   - Are roadmap items clearly marked as planned vs current?
6. **Positioning**
   - Is the one-line tagline clear?
   - Does the description match actual capabilities?

## Output

Produce a final report covering: lines changed in README.md, install instruction status, clone URL status, TOC issues, image/asset issues, and any manual follow-up.
