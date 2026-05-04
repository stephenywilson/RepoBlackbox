import { Command } from 'commander';
import { log, printBanner } from '../utils/render';
import { listTaskIds, loadTask } from '../bench/taskLoader';
import { runBenchPrepare } from '../bench/prepare';
import { runBenchScore } from '../bench/score';
import { runBenchReport } from '../bench/report';
import { runBenchDemo } from '../bench/demo';

function runBenchList(): void {
  printBanner('bench list — Available benchmark tasks');
  const ids = listTaskIds();
  if (ids.length === 0) {
    log.warn('No benchmark tasks found.');
    return;
  }
  log.raw('Available benchmark tasks:');
  for (const id of ids) {
    const task = loadTask(id);
    if (task) {
      log.raw(`  - ${id}  —  ${task.title}`);
    } else {
      log.raw(`  - ${id}`);
    }
  }
  console.log();
  log.info('Prepare a workspace:  repoblackbox bench prepare <task>');
  log.info('Run a demo:           repoblackbox bench demo');
  console.log();
}

export function registerBenchCommand(program: Command): void {
  const bench = program
    .command('bench')
    .description('Agent Task Bench — local benchmark tasks for AI coding agents');

  bench
    .command('list')
    .description('List available benchmark tasks')
    .action(() => {
      runBenchList();
    });

  bench
    .command('prepare <task>')
    .description('Prepare a fresh benchmark workspace')
    .option('-f, --force', 'Overwrite existing workspace')
    .action((task: string, options: { force?: boolean }) => {
      runBenchPrepare(task, options);
    });

  bench
    .command('score <task>')
    .description('Score the prepared benchmark workspace')
    .action((task: string) => {
      runBenchScore(task);
    });

  bench
    .command('report <task>')
    .description('Generate a Markdown report from the latest score')
    .action((task: string) => {
      runBenchReport(task);
    });

  bench
    .command('demo')
    .description('Run a self-contained demonstration (no AI required)')
    .action(() => {
      runBenchDemo();
    });
}
