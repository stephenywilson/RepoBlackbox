---
id: ui-screenshot-audit
title: UI Screenshot Audit
description: Review screenshots of a UI or GitHub README page and generate focused polish instructions.
target_agents:
  - Claude Code
  - Codex
  - Cursor
required_variables:
  - project_path
optional_variables:
  - screenshot_paths
  - target_page
  - audience
safety:
  - Do not rewrite the entire README or codebase.
  - Only produce actionable polish instructions.
  - Do not make changes without explicit user approval.
---

# Task: UI Screenshot Audit

Review screenshots or the live page and generate targeted polish instructions for:

- **Project path:** {{project_path}}
- **Screenshots / target page:** {{screenshot_paths}}{{target_page}}
- **Audience:** {{audience}}

## Constraints

- Produce a list of actionable, targeted changes only.
- Do not rewrite the entire README, landing page, or UI.
- Do not make changes without explicit approval.
- Focus on the highest-impact issues first.

## What to review

1. **Visual hierarchy**
   - Is the most important information visible above the fold?
   - Is there a clear heading structure?
2. **Spacing and density**
   - Is the layout too dense or too sparse?
   - Are code blocks and tables readable?
3. **Copy clarity**
   - Is the tagline immediately clear?
   - Are install commands correct and copy-paste-ready?
4. **Broken or missing assets**
   - Are any images failing to load?
   - Are SVG demos rendering correctly?
   - Are demo images stale or unrepresentative?
5. **Table formatting**
   - Are Markdown tables rendering as tables (not plain text)?
   - Are column widths reasonable?
6. **Links**
   - Do badge links point to valid URLs?
   - Do TOC links resolve?

## Output

Produce a prioritized list of specific improvements:
- **Must fix** — broken, misleading, or inaccurate
- **Should fix** — clarity or presentation issues
- **Nice to have** — cosmetic polish

For each item: what the issue is, what to change, and where (file + line if applicable).
