---
id: cli-smoke-test
title: CLI Smoke Test
description: Add or improve a smoke test for a CLI project.
target_agents:
  - Claude Code
  - Codex
  - Cursor
required_variables:
  - project_path
  - cli_command
optional_variables:
  - test_runner
  - smoke_script_path
safety:
  - Use a temporary directory under /tmp for any file operations.
  - Do not pollute the actual project being tested.
  - Do not call any external API or model provider.
  - Do not commit credentials.
---

# Task: CLI Smoke Test

Add or improve a smoke test for:

- **Project path:** {{project_path}}
- **CLI command:** {{cli_command}}
- **Test runner:** {{test_runner}}
- **Smoke script:** {{smoke_script_path}}

## Constraints

- All file operations must happen inside `/tmp/<test-id>/`.
- Do not modify any real project during the test run.
- Do not call any external API.
- Trap EXIT to clean up temp directories.

## Steps

1. **Choose a script location**
   - Bash: `scripts/smoke-test.sh`
   - npm script: `"smoke": "bash scripts/smoke-test.sh"`
2. **Cover the basics**
   - `{{cli_command}} --help` exits 0
   - `{{cli_command}} --version` prints expected version
3. **Cover each top-level command**
   - For each command, run a minimal happy-path scenario
   - Verify expected output files are created
4. **Cover edge cases relevant to release safety**
   - Missing required argument exits non-zero
   - `--force` overwrites correctly when expected
   - Idempotent commands can run twice without error
5. **Use temp directories**
   - `TEST_DIR="/tmp/<project>-smoke-$$"`
   - `trap "rm -rf $TEST_DIR" EXIT`
6. **Output checks**
   - `[ -f "expected/file.txt" ] || fail "missing expected file"`
   - `grep -q "expected text" output || fail "missing expected text"`
7. **Make it runnable in CI**
   - Use only POSIX-compatible commands if possible
   - Avoid macOS-specific flags (`sed -i.bak` instead of `sed -i ''`)

## Output

Report covering: script path, scenarios covered, edge cases tested, total checks, expected runtime, and CI compatibility.
