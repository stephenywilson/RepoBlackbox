import path from 'path';
import { ensureDir, fileExists, writeFile } from '../utils/fs';
import { log, printBanner } from '../utils/render';
import { getLocalSkillsDir } from './loader';

const EXAMPLE_SKILL = `---
id: example-custom-skill
title: Example Custom Skill
description: Example local RepoBlackbox skill for a constrained AI coding task.
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
  - Run checks before reporting completion.
---

# Task: {{task}}

You are about to perform an AI coding task inside:

**Project path:** {{project_path}}

## Before you start

1. Read this prompt fully.
2. Read \`AGENT_RULES.md\` if it exists in the project.
3. State which files you plan to touch and why, **before editing any code**.

## Task description

{{task}}

## Scope

**Allowed files / patterns:** {{allowed_files}}

**Forbidden files / patterns:** {{forbidden_files}}

## Constraints

- Only work inside \`{{project_path}}\`.
- Do not touch files outside the declared allowed scope.
- Do not touch \`.env\`, \`package.json\`, or secret files unless explicitly listed in allowed files.
- Make minimal changes — do not rewrite unrelated modules.
- Do not delete existing functionality.
- If you are unsure whether a file is in scope, do not touch it.

## Run checks before reporting done

- Build the project if applicable.
- Run the test suite or smoke test if available.
- Report whether all checks passed.

## Final report

After completing the task, provide:

1. Every file that changed (with a one-line reason).
2. Whether any forbidden files were touched (and why, if yes).
3. Whether all build/test checks passed.
4. Confirmation that the success criteria described in the task are met.
`;

export interface InitOptions {
  force?: boolean;
  customDir?: string;
}

export function runSkillInit(opts: InitOptions = {}): void {
  printBanner('skill init — Set up local skill directory');

  const localDir = getLocalSkillsDir(opts.customDir);
  const examplePath = path.join(localDir, 'example-custom-skill.md');

  if (!fileExists(localDir)) {
    ensureDir(localDir);
    log.success(`Created local skill directory: ${localDir}`);
  } else {
    log.skip(`Local skill directory already exists: ${localDir}`);
  }

  if (fileExists(examplePath) && !opts.force) {
    log.skip(`example-custom-skill.md already exists (pass --force to overwrite)`);
  } else {
    writeFile(examplePath, EXAMPLE_SKILL);
    if (opts.force && fileExists(examplePath)) {
      log.success(`Overwrote example-custom-skill.md`);
    } else {
      log.success(`Created ${examplePath}`);
    }
  }

  console.log();
  log.info(`Local skill directory: ${localDir}`);
  log.info('Edit or add .md files there to create your own skills.');
  log.raw('');
  log.raw('  repoblackbox skill list --local');
  log.raw('  repoblackbox skill show example-custom-skill --local');
  log.raw('  repoblackbox skill use example-custom-skill --var project_path=/path --var task="..."');
  console.log();
}
