---
id: security-privacy-scan
title: Security & Privacy Scan
description: Scan public repo content for private paths, API keys, mock secrets, server URLs, and internal project references.
target_agents:
  - Claude Code
  - Codex
  - Cursor
required_variables:
  - project_path
optional_variables:
  - internal_project_names
  - personal_username
safety:
  - This skill scans for sensitive content; it does NOT exfiltrate any secrets.
  - Do not paste real secrets into reports.
  - If a real secret is found, redact it before reporting.
  - Do not commit changes that contain real secrets in their diff.
---

# Task: Security & Privacy Scan

You are scanning the following repository for content that should not be public.

- **Project path:** {{project_path}}
- **Internal project names to flag:** {{internal_project_names}}
- **Personal username to flag:** {{personal_username}}

## Constraints

- Do not exfiltrate or transmit any secrets.
- Redact any real secrets before reporting.
- Do not commit changes containing real secrets.
- Distinguish clearly between real secrets, mock examples, and harmless substrings.

## Steps

1. **Personal local paths**
   - `grep -R "/Users/{{personal_username}}" .`
   - `grep -R "/home/{{personal_username}}" .`
2. **API key patterns**
   - `grep -R "OPENAI_API_KEY" .`
   - `grep -R "ANTHROPIC_API_KEY" .`
   - `grep -R "sk-" .` (note: many false positives — `task-id`, `risk-model`, etc.)
   - Provider-specific patterns: `AKIA`, `AIza`, `ghp_`, `gho_`
3. **`.env` references**
   - Are `.env` files committed by mistake?
   - Are `.env.example` files free of real values?
4. **Internal project names**
   - For each name in `{{internal_project_names}}`, grep across:
     - `README.md`, `docs/`, `package.json`
     - source files
     - benchmark / examples / skills directories
5. **Server URLs / IPs**
   - `grep -R "http://[0-9]" .` (internal IPs)
   - `grep -R "internal\." .`
6. **Sanitize**
   - Replace real-looking secrets with clearly-mock placeholders
   - Replace personal paths with `/path/to/project`
   - Remove internal project name leaks unless intentional

## Output

Final report with:
- Each scan pattern and its result (clean / N hits)
- For non-clean results: harmless vs requires-action classification
- Files changed during sanitization
- Remaining manual review items
