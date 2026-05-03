# Task Scope

> Define this before each AI coding session. Paste into Claude Code / Codex / Cursor.

---

## Task

(Describe the specific task. Be precise. Example: "Refactor the homepage hero section to use the new design tokens. Do not touch the navigation or footer.")

## Allowed Files / Patterns

The AI agent may only edit files matching these paths or patterns:

```
(list specific files or glob patterns)
(example: src/components/home/Hero.tsx)
(example: src/styles/tokens.css)
```

## Forbidden Files / Patterns

The AI agent must NOT touch these files under any circumstances:

```
.env
.env.*
package.json
package-lock.json
pnpm-lock.yaml
yarn.lock
bun.lockb
src/lib/auth/**
src/lib/billing/**
src/lib/stripe/**
```

## Success Criteria

The task is complete when:

- (specific, testable outcome)
- (example: hero renders correctly at all breakpoints)
- (example: existing navigation and footer are unchanged)
- (example: build passes with no TypeScript errors)

## Notes for the Agent

- Read `AGENT_RULES.md` before starting.
- Keep changes minimal and scoped to the allowed files above.
- Do not rewrite unrelated modules.
- Do not delete existing functionality.
- After editing, list every changed file and explain why it changed.
- If you are unsure whether to touch a file — do not touch it.

---

*Created via `repoblackbox scope` — RepoBlackbox AI coding agent safety layer*
