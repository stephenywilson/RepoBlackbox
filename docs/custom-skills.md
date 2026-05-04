# Custom User Skill Directories

> Local skill packs for your project — added in v0.4.

## What custom skills are

RepoBlackbox v0.3 shipped with 10 built-in workflow skills. These are global — they come with the
package and are available in every project.

RepoBlackbox v0.4 adds **custom user skill directories**: project-local skills that live inside
`.repoblackbox/skills/` alongside your other RepoBlackbox config. They use the same Markdown +
YAML frontmatter format as built-in skills.

Custom skills are useful for:

- Project-specific release checklists
- Team-specific refactor constraints
- Org-specific security scan patterns
- Any workflow that is too specific to belong in a shared built-in skill

## Default directory

```
.repoblackbox/skills/
```

This directory lives in the root of the project where you run RepoBlackbox. It is not shipped with
the package; it is local to your project.

## Initialize the local skill directory

```bash
repoblackbox skill init
```

This creates `.repoblackbox/skills/` and adds an `example-custom-skill.md` to get you started.

To overwrite the example file if it already exists:

```bash
repoblackbox skill init --force
```

`skill init` will **never delete your other skill files** — `--force` only overwrites the example.

## Listing skills

```bash
# Show built-in and local skills (default)
repoblackbox skill list

# Show only local skills
repoblackbox skill list --local

# Show only built-in skills
repoblackbox skill list --built-in

# Explicitly show both
repoblackbox skill list --all
```

## Using custom skills

```bash
# Show details of a local skill
repoblackbox skill show example-custom-skill --local

# Render a local skill with variable substitution
repoblackbox skill use example-custom-skill \
  --var project_path=/path/to/project \
  --var task="Refactor homepage hero" \
  --local

# Write rendered prompt to a file
repoblackbox skill use example-custom-skill \
  --var project_path=/path/to/project \
  --var task="Refactor homepage hero" \
  --output .repoblackbox/skills/my-rendered-prompt.md
```

## Skill file format

Each skill is a Markdown file with YAML frontmatter:

```markdown
---
id: my-skill
title: My Custom Skill
description: One-line description of what this skill does.
target_agents:
  - Claude Code
  - Codex
  - Cursor
required_variables:
  - project_path
  - task
optional_variables:
  - allowed_files
  - forbidden_files
safety:
  - Only work inside the provided project path.
  - Do not modify unrelated projects.
---

# Task: {{task}}

**Project path:** {{project_path}}

**Allowed files:** {{allowed_files}}

**Forbidden files:** {{forbidden_files}}

...prompt body...
```

### Frontmatter fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | no (defaults to filename) | Stable skill identifier |
| `title` | string | yes | Short human-readable title |
| `description` | string | yes | One-line description |
| `target_agents` | list | no | Which AI agents the skill targets |
| `required_variables` | list | no | Variables that must be supplied via `--var` |
| `optional_variables` | list | no | Variables that may be omitted |
| `safety` | list | no | Safety constraints for the AI agent |

### Variable syntax

In the prompt body, use `{{variable_name}}` (double braces). Variables are supplied via
`--var key=value` on the command line. Multiple `--var` flags are supported.

Optional variables that are not supplied remain as `{{variable_name}}` in the output — the agent
can see they need filling in.

## Local vs built-in resolution

By default, `skill show` and `skill use` use **local-first** resolution:

1. Check `.repoblackbox/skills/<skill>.md` first.
2. If not found, check the built-in `skills/` directory.

This means a local skill can **override a built-in skill** with the same `id`. When an override
occurs, the CLI prints:

```
ℹ Using local skill override: readme-audit
```

To force a specific source:

```bash
repoblackbox skill show readme-audit --local     # only search local
repoblackbox skill show readme-audit --built-in  # only search built-in
```

## Custom skill directory with --skills-dir

To use a directory other than `.repoblackbox/skills/`:

```bash
repoblackbox skill list --skills-dir ./team-skills
repoblackbox skill show my-skill --skills-dir ./team-skills
repoblackbox skill use my-skill --skills-dir ./team-skills --var project_path=/tmp/repo
```

`--skills-dir` replaces the default `.repoblackbox/skills/` path for the current command.

## Safety notes

- `skill init` only creates files in `.repoblackbox/skills/`. It never writes outside that dir.
- `skill use` renders and prints prompt text. It does not execute the prompt or call any AI provider.
- No API keys are required.
- Local skill files are never read by any remote service.
- Add `.repoblackbox/skills/` to `.gitignore` if you do not want to commit your local skills.

## Limitations

- Custom skill directories are project-local (not shared across projects by default).
- There is no sync, remote fetch, or team sharing yet (team policy files are planned).
- Variable substitution is plain text only — no conditionals or expressions.

---

*Custom User Skill Directories is part of [RepoBlackbox](https://github.com/stephenywilson/RepoBlackbox) v0.4.*
