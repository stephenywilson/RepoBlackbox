# Protected Files

The AI coding agent must **not** edit the files or directories listed below unless explicitly approved in `TASK_SCOPE.md` for a specific task.

If the agent believes it needs to touch a protected file, it must stop and ask for approval first.

---

## Environment & Secrets

```
.env
.env.*
.env.local
.env.production
.env.staging
.env.development
```

**Why:** These files contain secrets, API keys, and environment-specific configuration. Editing them can expose credentials or break deployments.

---

## Dependency & Package Files

```
package.json
package-lock.json
pnpm-lock.yaml
yarn.lock
bun.lockb
```

**Why:** Unintended changes to these files can introduce security vulnerabilities, break reproducible builds, or change behavior across environments.

---

## Deployment & Infrastructure

```
Dockerfile
docker-compose.yml
docker-compose.override.yml
vercel.json
netlify.toml
.github/workflows/**
.travis.yml
.circleci/**
```

**Why:** Changes here can break production deployments or CI/CD pipelines.

---

## Auth, Billing, Payments

```
src/lib/auth/**
src/lib/billing/**
src/lib/stripe/**
src/lib/payments/**
pages/api/auth/**
app/api/auth/**
```

**Why:** These are high-risk files that handle authentication and money. Bugs here can cause security breaches or financial loss.

---

## API & Backend Routes

```
src/api/**
app/api/**
pages/api/**
```

**Why:** API routes are externally accessible. Unscoped changes can expose endpoints or break existing consumers.

---

## Database

```
database/**
prisma/**
migrations/**
drizzle/**
```

**Why:** Database schema changes require careful migration planning and can cause data loss if done incorrectly.

---

## Application Config

```
src/config/**
config/**
```

**Why:** Application-level configuration changes can have wide, hard-to-predict effects.

---

## Override Procedure

If a task requires touching a protected file:

1. The developer must explicitly list the file in `TASK_SCOPE.md` under "Allowed Files".
2. The AI agent must confirm the override before proceeding.
3. A snapshot must be taken before the edit.
4. An audit must be run after.

---

*Managed by RepoBlackbox — AI coding agent safety layer*
