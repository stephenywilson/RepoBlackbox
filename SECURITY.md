# Security Policy

## What RepoBlackbox Does and Does Not Do

**RepoBlackbox is a workflow safety layer, not a security scanner.**

It is designed to help developers understand what an AI coding agent changed in their repository. It is not designed to detect secrets, scan for vulnerabilities, or audit code for security correctness.

### RepoBlackbox does not read `.env` file content

For files matching `.env` and `.env.*`, RepoBlackbox records only:
- Whether the file exists
- File size in bytes
- Last modification time

It does **not** open, read, hash, or store the content of these files. This is enforced in `src/commands/snapshot.ts` via the `isSensitiveFile()` check.

### Audit reports may contain file paths

The audit and report files saved to `.repoblackbox/reports/` contain relative file paths from your project. These paths could reveal project structure.

If you share or publish an audit report:
- Review it for any paths that reveal sensitive information about your infrastructure
- The reports do not contain file contents, only paths and hashes

### Snapshot files contain SHA-256 hashes

Snapshot files saved to `.repoblackbox/snapshots/` contain SHA-256 hashes of non-sensitive file contents. SHA-256 is a one-way hash — it cannot be reversed to recover file content. However, a hash can confirm whether a known file is present.

### `.repoblackbox/` is local only

RepoBlackbox does not send any data to external services. All snapshots, audits, and reports are stored locally in `.repoblackbox/`. Nothing is transmitted over the network.

### The `.repoblackbox/` directory

It is recommended to add `.repoblackbox/` to your `.gitignore` if your project is public, to avoid committing local audit reports.

---

## Reporting a Security Issue

If you discover a security issue in RepoBlackbox itself (for example, a way to make it read `.env` content, or a path traversal bug), please report it responsibly:

1. **Do not open a public GitHub issue** for security vulnerabilities.
2. Email: `security@catalayer.com`
3. Include: a description of the issue, steps to reproduce, and the potential impact.

We will respond within 5 business days and work to release a fix promptly.

---

## Supported Versions

| Version | Supported |
| --- | --- |
| 0.1.1 | Yes |
| 0.1.0 | No (upgrade to 0.1.1) |

---

*RepoBlackbox is maintained by [Catalayer AI](https://catalayer.com).*
