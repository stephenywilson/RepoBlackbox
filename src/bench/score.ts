import path from 'path';
import { readJSON, writeJSON, fileExists } from '../utils/fs';
import { log, printBanner, riskBadge } from '../utils/render';
import { matchesPattern } from '../utils/pattern';
import { nowISO } from '../utils/time';
import { loadTask } from './taskLoader';
import { workspaceRepoDir, workspaceBaselinePath, BENCH_REPORTS_DIR } from './paths';
import { diffAgainstBaseline } from './diff';
import { runCheck } from './checks';
import { Baseline, ScoreResult, CheckResult } from './types';
import chalk from 'chalk';

export function runBenchScore(taskId: string): ScoreResult {
  printBanner(`bench score — ${taskId}`);

  const task = loadTask(taskId);
  if (!task) {
    log.error(`Unknown task: ${taskId}`);
    process.exit(1);
  }

  const repoDir = workspaceRepoDir(taskId);
  if (!fileExists(repoDir)) {
    log.error(`Workspace not prepared: ${repoDir}`);
    log.info(`Run: repoblackbox bench prepare ${taskId}`);
    process.exit(1);
  }

  const baseline = readJSON<Baseline>(workspaceBaselinePath(taskId));
  if (!baseline) {
    log.error('Baseline missing — re-run prepare with --force.');
    process.exit(1);
  }

  // Compute diff
  const diff = diffAgainstBaseline(repoDir, baseline);
  const allChanged = [...diff.changed, ...diff.added, ...diff.deleted];

  // Detect forbidden file violations independently of checks
  const forbiddenViolations = allChanged.filter(f =>
    task.forbidden_files.some(p => matchesPattern(f, p))
  );

  // Run all checks
  const ctx = { repoDir, baseline, diff };
  const passed: CheckResult[] = [];
  const failed: CheckResult[] = [];
  let score = 0;
  let maxScore = 0;

  for (const check of task.checks) {
    maxScore += check.points;
    const result = runCheck(check, ctx);
    if (result.passed) {
      passed.push(result);
      score += check.points;
    } else {
      failed.push(result);
    }
  }

  // Reconcile with task scoring metadata
  const declaredMax = task.scoring?.max ?? maxScore;
  const passing = task.scoring?.passing ?? Math.ceil(declaredMax * 0.7);

  const status: 'PASS' | 'FAIL' = score >= passing ? 'PASS' : 'FAIL';

  const warnings: string[] = [];
  if (declaredMax !== maxScore) {
    warnings.push(`task.scoring.max (${declaredMax}) != sum of check points (${maxScore})`);
  }
  if (forbiddenViolations.length > 0 && status === 'PASS') {
    warnings.push('forbidden files were touched even though score passed — review carefully');
  }

  const result: ScoreResult = {
    taskId,
    taskTitle: task.title,
    score,
    maxScore,
    passing,
    status,
    passed,
    failed,
    warnings,
    changedFiles: diff.changed,
    addedFiles: diff.added,
    deletedFiles: diff.deleted,
    forbiddenViolations,
    createdAt: nowISO(),
  };

  // Print to terminal
  log.section('Diff vs baseline');
  if (allChanged.length === 0) {
    log.info('No changes detected.');
  } else {
    if (diff.added.length > 0) {
      log.raw(`  Added    (${diff.added.length}):`);
      diff.added.forEach(f => log.raw(`    + ${f}`));
    }
    if (diff.changed.length > 0) {
      log.raw(`  Modified (${diff.changed.length}):`);
      diff.changed.forEach(f => log.raw(`    ~ ${f}`));
    }
    if (diff.deleted.length > 0) {
      log.raw(`  Deleted  (${diff.deleted.length}):`);
      diff.deleted.forEach(f => log.raw(`    - ${f}`));
    }
  }

  if (forbiddenViolations.length > 0) {
    log.section('Forbidden file violations');
    forbiddenViolations.forEach(f => log.warn(f));
  }

  log.section('Checks');
  for (const c of passed) {
    log.success(`${chalk.green('+' + c.points)}  ${c.id} — ${c.description}`);
  }
  for (const c of failed) {
    log.error(`${chalk.red('  0')}  ${c.id} — ${c.description} ${chalk.dim('(' + (c.detail ?? '') + ')')}`);
  }

  log.section(`Score: ${score} / ${maxScore}   Status: ${status === 'PASS' ? riskBadge('LOW') : riskBadge('HIGH')}`);
  console.log();

  if (warnings.length > 0) {
    log.section('Warnings');
    warnings.forEach(w => log.warn(w));
    console.log();
  }

  // Save score JSON
  writeJSON(path.join(BENCH_REPORTS_DIR, `${taskId}-score.json`), result);
  writeJSON(path.join(BENCH_REPORTS_DIR, 'latest-score.json'), result);
  log.info(`Score saved: ${path.join(BENCH_REPORTS_DIR, `${taskId}-score.json`)}`);
  log.info(`Run: repoblackbox bench report ${taskId}`);
  console.log();

  return result;
}
