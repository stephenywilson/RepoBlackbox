# Agent Rules

This project uses RepoBlackbox to keep AI coding agent work controlled, reviewable, and reversible.

**Before editing any code, the AI agent must:**

1. Read this file.
2. Read `TASK_SCOPE.md` to understand the task boundaries.
3. Read `PROTECTED_FILES.md` to understand which files must not be touched.
4. Explain which files you plan to modify — before modifying them.
5. Keep changes minimal and strictly scoped to the allowed files.

**During editing, the AI agent must not:**

- Rewrite unrelated modules.
- Delete existing features or functionality.
- Touch protected files unless explicitly approved in `TASK_SCOPE.md`.
- Modify environment files (`.env`, `.env.*`) under any circumstances.
- Modify auth, billing, payment, or API gateway files.
- Modify CI/CD, deployment, or infrastructure files.
- Modify `package.json`, lock files, or build config without explicit instruction.
- Change the existing design system, component API, or naming conventions.
- Leave partial implementations or commented-out code.

**After editing, the AI agent must:**

1. List every file that was changed.
2. Explain why each file changed.
3. Confirm that no protected files were touched.
4. Confirm that the task scope was respected.
5. Describe any decisions or tradeoffs made.

---

*Managed by RepoBlackbox — AI coding agent safety layer*
