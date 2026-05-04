---
id: agent-safe-refactor
title: Agent-Safe Refactor
description: Guide an AI coding agent through a constrained refactor with explicit scope, forbidden files, and a minimal-diff requirement.
target_agents:
  - Claude Code
  - Codex
  - Cursor
  - Copilot
required_variables:
  - project_path
  - task_description
  - allowed_files
  - forbidden_files
optional_variables:
  - success_criteria
  - test_command
  - notes
safety:
  - Only edit files listed in allowed_files.
  - Never touch files listed in forbidden_files.
  - Do not delete existing functionality.
  - Run tests before and after refactoring.
  - Report every file changed and why.
---

# Task: Agent-Safe Refactor

You are about to perform a constrained refactor. Read the entire task before touching any code.

- **Project path:** {{project_path}}
- **Task:** {{task_description}}
- **Allowed files / patterns:** {{allowed_files}}
- **Forbidden files / patterns:** {{forbidden_files}}
- **Success criteria:** {{success_criteria}}
- **Test command:** {{test_command}}
- **Notes:** {{notes}}

## Rules — read before starting

1. **Only touch files in `{{allowed_files}}`.**
2. **Never touch `{{forbidden_files}}`** — not even to read and leave unchanged.
3. **Keep the diff minimal.** Prefer one-line changes over full-file rewrites.
4. **Do not delete existing functionality** unless the task explicitly says to remove it.
5. **Do not rewrite unrelated modules** even if you see improvements.
6. **If you are unsure whether a file is in scope, do not touch it.**

## Steps

1. **Understand the current state**
   - Read the files you are allowed to touch
   - Understand what they do and why
2. **Plan the change**
   - State which files you will change and why, before editing
3. **Run tests before editing** — `{{test_command}}`
4. **Make the change**
   - Smallest possible edit to achieve `{{task_description}}`
5. **Run tests after editing** — `{{test_command}}`
6. **Report**
   - Every file that changed (with reason)
   - Before/after summary for each change
   - Test results
   - Confirmation no forbidden files were touched
   - Confirmation the success criteria are met: `{{success_criteria}}`

## Output

A final report containing: files changed, reasoning, test results, forbidden-file confirmation, and success criteria status.
