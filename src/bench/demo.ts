import fs from 'fs';
import path from 'path';
import { log, printBanner } from '../utils/render';
import { runBenchPrepare } from './prepare';
import { runBenchScore } from './score';
import { runBenchReport } from './report';
import { workspaceRepoDir } from './paths';

const DEMO_TASK = 'readme-url-fix';

function applyDeterministicFix(taskId: string): boolean {
  // For readme-url-fix: replace the wrong URL with the correct one.
  // No AI required — purely deterministic.
  const readmePath = path.join(workspaceRepoDir(taskId), 'README.md');
  if (!fs.existsSync(readmePath)) {
    log.warn(`README.md not found in workspace: ${readmePath}`);
    return false;
  }
  const content = fs.readFileSync(readmePath, 'utf8');
  const fixed = content.replace(
    /github\.com\/catalayer\/repoblackbox/g,
    'github.com/stephenywilson/RepoBlackbox'
  );
  if (content === fixed) {
    log.warn('Pattern not found — fixture may already be fixed.');
    return false;
  }
  fs.writeFileSync(readmePath, fixed, 'utf8');
  log.success(`Applied deterministic fix to README.md (no AI used)`);
  return true;
}

export function runBenchDemo(): void {
  printBanner('bench demo — local self-contained demonstration');

  log.info(`Demo task: ${DEMO_TASK}`);
  console.log();

  // 1. Prepare
  runBenchPrepare(DEMO_TASK, { force: true });

  // 2. Apply deterministic fix
  log.section('Applying deterministic fix (simulated agent)');
  applyDeterministicFix(DEMO_TASK);
  console.log();

  // 3. Score
  const score = runBenchScore(DEMO_TASK);

  // 4. Report
  const reportPath = runBenchReport(DEMO_TASK);

  // 5. Summary
  log.section('Demo summary');
  log.info(`Task:   ${DEMO_TASK}`);
  log.info(`Score:  ${score.score} / ${score.maxScore}`);
  log.info(`Status: ${score.status}`);
  log.info(`Report: ${reportPath}`);
  console.log();
  log.info('No API keys, no external services, no AI model calls.');
  console.log();
}
