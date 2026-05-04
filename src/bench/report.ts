import path from 'path';
import { readJSON, writeFile } from '../utils/fs';
import { log, printBanner } from '../utils/render';
import { nowISO } from '../utils/time';
import { BENCH_REPORTS_DIR } from './paths';
import { loadTask } from './taskLoader';
import { ScoreResult } from './types';

function buildReport(taskId: string, score: ScoreResult, taskInstructions: string): string {
  const lines: string[] = [];
  lines.push('# RepoBlackbox Agent Task Bench Report');
  lines.push('');
  lines.push(`*Generated: ${nowISO()}*`);
  lines.push('');

  lines.push('## Task');
  lines.push('');
  lines.push(`- **ID:** \`${score.taskId}\``);
  lines.push(`- **Title:** ${score.taskTitle}`);
  lines.push('');
  lines.push(taskInstructions.trim());
  lines.push('');

  lines.push('## Score');
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Score | **${score.score} / ${score.maxScore}** |`);
  lines.push(`| Passing threshold | ${score.passing} |`);
  lines.push(`| Status | **${score.status}** |`);
  lines.push(`| Files added | ${score.addedFiles.length} |`);
  lines.push(`| Files modified | ${score.changedFiles.length} |`);
  lines.push(`| Files deleted | ${score.deletedFiles.length} |`);
  lines.push(`| Forbidden violations | ${score.forbiddenViolations.length} |`);
  lines.push('');

  lines.push('## Passed Checks');
  lines.push('');
  if (score.passed.length === 0) {
    lines.push('_None._');
  } else {
    for (const c of score.passed) {
      lines.push(`- ✅ \`${c.id}\` (+${c.points}) — ${c.description}`);
    }
  }
  lines.push('');

  lines.push('## Failed Checks');
  lines.push('');
  if (score.failed.length === 0) {
    lines.push('_None._');
  } else {
    for (const c of score.failed) {
      lines.push(`- ❌ \`${c.id}\` (0 / ${c.points}) — ${c.description}`);
      if (c.detail) lines.push(`  - ${c.detail}`);
    }
  }
  lines.push('');

  lines.push('## Warnings');
  lines.push('');
  if (score.warnings.length === 0) {
    lines.push('_None._');
  } else {
    score.warnings.forEach(w => lines.push(`- ⚠️ ${w}`));
  }
  lines.push('');

  lines.push('## Files Changed');
  lines.push('');
  if (score.addedFiles.length > 0) {
    lines.push(`### Added (${score.addedFiles.length})`);
    score.addedFiles.forEach(f => lines.push(`- \`${f}\``));
    lines.push('');
  }
  if (score.changedFiles.length > 0) {
    lines.push(`### Modified (${score.changedFiles.length})`);
    score.changedFiles.forEach(f => lines.push(`- \`${f}\``));
    lines.push('');
  }
  if (score.deletedFiles.length > 0) {
    lines.push(`### Deleted (${score.deletedFiles.length})`);
    score.deletedFiles.forEach(f => lines.push(`- \`${f}\``));
    lines.push('');
  }
  if (
    score.addedFiles.length === 0 &&
    score.changedFiles.length === 0 &&
    score.deletedFiles.length === 0
  ) {
    lines.push('_No file changes detected._');
    lines.push('');
  }

  lines.push('## Scope Violations');
  lines.push('');
  if (score.forbiddenViolations.length === 0) {
    lines.push('_None._');
  } else {
    score.forbiddenViolations.forEach(f => lines.push(`- ⛔ \`${f}\``));
  }
  lines.push('');

  lines.push('## Suggested Review');
  lines.push('');
  if (score.status === 'PASS' && score.forbiddenViolations.length === 0) {
    lines.push('- Review the diff and confirm the change is minimal.');
    lines.push('- Verify that the agent did not leave dead code or comments.');
  } else {
    lines.push('- Investigate failed checks above.');
    if (score.forbiddenViolations.length > 0) {
      lines.push('- Forbidden files were modified — manual review required.');
    }
    lines.push('- Re-run with `repoblackbox bench prepare ' + taskId + ' --force` to reset.');
  }
  lines.push('');

  lines.push('## Notes');
  lines.push('');
  lines.push('Scoring is deterministic and local. RepoBlackbox does not call any AI model or external API to score tasks.');
  lines.push('');

  return lines.join('\n');
}

export function runBenchReport(taskId: string): string {
  printBanner(`bench report — ${taskId}`);

  const score = readJSON<ScoreResult>(
    path.join(BENCH_REPORTS_DIR, `${taskId}-score.json`)
  );
  if (!score) {
    log.error(`No score found for ${taskId}.`);
    log.info(`Run: repoblackbox bench score ${taskId}`);
    process.exit(1);
  }

  const task = loadTask(taskId);
  const instructions = task?.instructions ?? '_(task instructions not found)_';

  const md = buildReport(taskId, score, instructions);

  const stamped = path.join(BENCH_REPORTS_DIR, `${taskId}-report.md`);
  const latest = path.join(BENCH_REPORTS_DIR, 'latest-report.md');

  writeFile(stamped, md);
  writeFile(latest, md);

  log.success(`Report saved: ${stamped}`);
  log.success(`Updated: ${latest}`);
  console.log();

  return stamped;
}
