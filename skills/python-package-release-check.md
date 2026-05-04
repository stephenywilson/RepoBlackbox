---
id: python-package-release-check
title: Python Package Release Check
description: Prepare a Python CLI package for PyPI release, without publishing by default.
target_agents:
  - Claude Code
  - Codex
  - Cursor
required_variables:
  - project_path
  - package_name
  - version
optional_variables:
  - cli_name
  - python_version
safety:
  - Only work inside the provided project_path.
  - Do not run twine upload or python -m build && twine upload unless explicitly instructed.
  - Do not log PyPI tokens or .pypirc contents.
  - Do not modify unrelated projects.
---

# Task: Python Package Release Check

Prepare for a PyPI release of:

- **Project path:** {{project_path}}
- **Package name:** {{package_name}}
- **Version:** {{version}}
- **CLI entrypoint:** {{cli_name}}
- **Python version:** {{python_version}}

## Constraints

- Only work inside `{{project_path}}`.
- **Do not run `twine upload`** or any publish command unless explicitly instructed.
- Do not log or commit PyPI tokens.
- Do not commit `~/.pypirc`.

## Steps

1. **pyproject.toml**
   - `[project] name` = `{{package_name}}`
   - `[project] version` = `{{version}}`
   - `[project.scripts]` defines the `{{cli_name}}` entry point
   - `[project] dependencies` is accurate
   - `[project] requires-python` is set
2. **Package structure**
   - Source under `src/{{package_name}}/` or top-level package directory
   - `__init__.py` present
   - `__version__` is `{{version}}` if exposed
3. **Editable install**
   - `pip install -e .` succeeds
   - `python -m {{package_name}} --help` works (or `{{cli_name}} --help`)
   - `python -c "import {{package_name}}; print({{package_name}}.__version__)"` returns `{{version}}` if exposed
4. **Build artifacts**
   - If `build` package is available: `python -m build`
   - Verify both `.tar.gz` and `.whl` are produced
   - Inspect contents with `tar -tzf dist/*.tar.gz` — confirm tests, `.env`, secrets are NOT included
5. **Smoke test**
   - CLI `--help` and `--version` work
   - Core commands work end-to-end
6. **Privacy scan**
   - Run privacy scan (see `security-privacy-scan` skill)
7. **Pre-publish check** (do not publish)
   - `twine check dist/*` to validate metadata

## Output

Report covering: pyproject.toml correctness, editable install result, build artifact contents, smoke test result, privacy scan, and explicit confirmation that PyPI upload has NOT been run.
