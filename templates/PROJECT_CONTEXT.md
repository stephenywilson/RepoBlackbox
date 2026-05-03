# Project Context

This repository uses **RepoBlackbox** to keep AI coding agent work controlled, reviewable, and reversible.

## About RepoBlackbox

RepoBlackbox was created from real development experience while building Catalayer, Chrome extensions, API services, and AI-driven workflow tools.

After repeatedly using Claude Code, Codex, Cursor, and other AI coding agents in production-style projects, a simple rule emerged:

> Before an AI agent changes the codebase, it should know the boundaries.  
> After it changes the codebase, we should know exactly what happened.

**The goal is not to slow down AI coding.  
The goal is to make AI coding safer for real projects.**

## How it works

```
repoblackbox init       — set up safety documents
repoblackbox scope      — define task before each AI session
repoblackbox snapshot   — capture repo state before AI edits
repoblackbox audit      — review what the AI changed
repoblackbox report     — generate a full AI coding run report
```

## This Project

<!-- 
Edit this section to describe your specific project.
Example:
- Framework: Next.js 14 (App Router)
- Database: PostgreSQL via Prisma
- Auth: NextAuth.js
- Payments: Stripe
- Deployed on: Vercel
-->

**Project name:** (your project name)  
**Framework:** (your framework)  
**Key directories:**

- `src/` — main application source
- `public/` — static assets

---

*Managed by RepoBlackbox — AI coding agent safety layer*
