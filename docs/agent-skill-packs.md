# Agent Skill Packs

> Structured, copy-paste-ready workflow prompts for AI coding agents — added in v0.3.

## What it is

Agent Skill Packs is a built-in command group inside RepoBlackbox that stores and renders reusable workflow prompts for AI coding agents. Each skill is a Markdown file with YAML frontmatter that declares its variables; the CLI substitutes your values and outputs a ready-to-paste task prompt.

It is the **workflow layer** that extends RepoBlackbox's existing safety layer (v0.1) and evaluation layer (v0.2).

## Why it exists

Developers using Claude Code, Codex, Cursor, Copilot, and other AI coding agents tend to repeat the same high-level workflows:

- Preparing a GitHub release
- Auditing a README before sharing
- Running a security/privacy scan
- Checking a CLI package before npm publish
- Doing a safe, constrained refactor

Writing these prompts from scratch every session is wasteful, and inconsistent prompts produce inconsistent results. Agent Skill Packs stores the proven workflow templates and renders them on demand with your project-specific variables filled in.

## Key properties

- **Local-only.** No API calls, no model providers, no telemetry.
- **Variable substitution.** Each skill declares required and optional variables; missing required variables are caught before output is generated.
- **Copy-paste-ready.** The rendered output is a complete task prompt. Paste it into Claude Code / Codex / Cursor and run.
- **Extensible.** Drop a Markdown file into the `skills/` directory to create a custom skill.
- **RepoBlackbox never runs agents.** It only renders prompt text.

## Command reference

```bash
repoblackbox skill list
# List all available built-in skills.

repoblackbox skill show <skill>
# Show skill metadata (title, description, required vars, safety notes) and a preview.

repoblackbox skill use <skill> --var key=value [--var key2=value2] ...
# Render the skill prompt with variables substituted and print to stdout.

repoblackbox skill use <skill> --var key=value --output <file>
# Write the rendered prompt to a file instead of stdout.
```

## Built-in skills (v0.3)

| Skill | Purpose |
|---|---|
| `github-release-polish` | Prepare an open-source repo for a GitHub release |
| `readme-audit` | Audit a README for install accuracy and copy-paste correctness |
| `repo-url-fix` | Fix wrong repo URLs after a rename or ownership change |
| `security-privacy-scan` | Scan for private paths, API keys, and internal project references |
| `npm-package-release-check` | Prepare a Node/TS CLI for npm publishing (without publishing) |
| `python-package-release-check` | Prepare a Python CLI for PyPI release (without publishing) |
| `cli-smoke-test` | Add or improve a CLI smoke test |
| `changelog-update` | Update CHANGELOG and release notes for a new version |
| `ui-screenshot-audit` | Generate targeted polish instructions from UI screenshots |
| `agent-safe-refactor` | Guide a constrained refactor with explicit allowed/forbidden files |

## Skill file format

Each skill lives at `skills/<id>.md` (or a custom directory for custom skills):

```markdown
---
id: my-skill
title: My Skill
description: One-line description.
target_agents:
  - Claude Code
  - Codex
required_variables:
  - project_path
  - version
optional_variables:
  - notes
safety:
  - Only work inside project_path.
---

# Task: My Skill

**Project path:** {{project_path}}
**Version:** {{version}}
**Notes:** {{notes}}

...prompt body...
```

### Frontmatter fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | no (defaults to filename) | Stable skill identifier |
| `title` | string | yes | Short human-readable title |
| `description` | string | yes | One-line description |
| `target_agents` | list | no | Agents this skill targets |
| `required_variables` | list | no | Variables that must be provided |
| `optional_variables` | list | no | Variables that may be omitted |
| `safety` | list | no | Safety constraints for the agent |

### Variable syntax

In the prompt body, use `{{variable_name}}` (double braces, any spacing inside).

Variables are supplied via `--var key=value` on the command line. Multiple `--var` flags are supported.

Optional variables that are not supplied remain as `{{variable_name}}` in the output (the agent can see they need filling in).

## Creating a custom skill

1. Create `skills/my-skill.md` inside your project (not the RepoBlackbox directory).
2. Copy the frontmatter format above.
3. Write the prompt body with `{{variable}}` placeholders.
4. Run `repoblackbox skill list` — your skill appears immediately if it is in `skills/`.

Wait — `repoblackbox skill list` reads from the built-in `skills/` directory inside the RepoBlackbox package, not the user's CWD. To use custom skills, point to them via the rendered file or run a modified build of RepoBlackbox.

> Custom skill directory support (e.g. `--skills-dir ./my-skills/`) is a planned v0.4 feature. In v0.3, copy custom skills into the built-in `skills/` folder if working from source.

## Example session

```bash
# 1. List skills
repoblackbox skill list

# 2. Preview a skill
repoblackbox skill show github-release-polish

# 3. Render with variables
repoblackbox skill use github-release-polish \
  --var project_path=/path/to/my-project \
  --var repo_url=https://github.com/myuser/myproject \
  --var version=1.2.3

# 4. Write to file
repoblackbox skill use readme-audit \
  --var project_path=/path/to/my-project \
  --var repo_url=https://github.com/myuser/myproject \
  --output .repoblackbox/skills/readme-audit.md

# 5. Paste into Claude Code
cat .repoblackbox/skills/readme-audit.md
# → copy the output → paste into Claude Code
```

## Safety notes

- **RepoBlackbox does not run AI agents automatically.** `skill use` only renders and prints prompt text.
- **No API keys are required.** Nothing is sent anywhere.
- **No external services are called.**
- The rendered prompt may reference external services (e.g., "run `npm publish`") but RepoBlackbox itself does not execute those commands.
- Skills include a safety section that tells the AI agent what it must and must not do. You are responsible for verifying the agent follows them.

## Limitations

- `skill list` only shows built-in skills from the package's `skills/` directory. Custom skill directories are not yet supported.
- There is no `skill copy` command. Use `--output` to write to a file, then copy from there.
- Variable substitution is text-only. No conditionals, loops, or expressions.
- Skills are static templates. They do not adapt to project structure automatically.

---

*Agent Skill Packs is part of [RepoBlackbox](https://github.com/stephenywilson/RepoBlackbox), a safety, evaluation, and workflow layer for AI coding agents.*
