import fs from 'fs';
import path from 'path';
import { ensureDir, writeJSON, writeFile, fileExists, readFile } from '../utils/fs';
import { log, printBanner } from '../utils/render';
import { nowISO } from '../utils/time';
import { loadTask, taskFixtureDir, taskMdPath, listTaskIds } from './taskLoader';
import {
  workspaceDir,
  workspaceRepoDir,
  workspaceBaselinePath,
  workspaceTaskMdPath,
  workspaceExpectedPath,
  BENCH_WORKSPACES_DIR,
} from './paths';
import { hashWorkspace } from './diff';
import { Baseline } from './types';

export interface PrepareOptions {
  force?: boolean;
}

export function runBenchPrepare(taskId: string, opts: PrepareOptions): void {
  printBanner(`bench prepare — ${taskId}`);

  const task = loadTask(taskId);
  if (!task) {
    log.error(`Unknown task: ${taskId}`);
    log.info(`Available: ${listTaskIds().join(', ') || '(none)'}`);
    process.exit(1);
  }

  const fixtureDir = taskFixtureDir(taskId);
  if (!fs.existsSync(fixtureDir)) {
    log.error(`Fixture missing for task ${taskId}: ${fixtureDir}`);
    process.exit(1);
  }

  const wsDir = workspaceDir(taskId);
  const wsRepo = workspaceRepoDir(taskId);

  if (fs.existsSync(wsDir)) {
    if (!opts.force) {
      log.error(`Workspace already exists: ${wsDir}`);
      log.info('Pass --force to overwrite.');
      process.exit(1);
    }
    log.warn(`Removing existing workspace (--force): ${wsDir}`);
    fs.rmSync(wsDir, { recursive: true, force: true });
  }

  ensureDir(BENCH_WORKSPACES_DIR);
  ensureDir(wsDir);

  // Copy fixture into workspace/repo
  fs.cpSync(fixtureDir, wsRepo, { recursive: true });
  log.success(`Copied fixture → ${wsRepo}`);

  // Copy TASK.md into workspace root for the agent
  const taskMd = readFile(taskMdPath(taskId));
  if (taskMd) {
    writeFile(workspaceTaskMdPath(taskId), taskMd);
    log.success(`TASK.md available at ${workspaceTaskMdPath(taskId)}`);
  }

  // Snapshot baseline hashes
  const fileHashes = hashWorkspace(wsRepo);
  const baseline: Baseline = {
    createdAt: nowISO(),
    files: Object.fromEntries(
      Object.entries(fileHashes).map(([k, v]) => [k, { sha256: v }])
    ),
  };
  writeJSON(workspaceBaselinePath(taskId), baseline);
  log.success(`Baseline saved (${Object.keys(fileHashes).length} files)`);

  // Save expected.json (task definition snapshot for scoring)
  writeJSON(workspaceExpectedPath(taskId), task);

  console.log();
  log.info(`Task: ${task.title}`);
  log.info(`Workspace: ${wsRepo}`);
  log.info(`Forbidden: ${task.forbidden_files.join(', ') || '(none)'}`);
  console.log();
  log.info('Next steps:');
  log.raw(`  1. Point your AI coding agent at: ${wsRepo}`);
  log.raw(`  2. Have the agent read TASK.md and complete the task`);
  log.raw(`  3. Run: repoblackbox bench score ${taskId}`);
  console.log();
}
