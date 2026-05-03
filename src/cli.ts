#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from './commands/init';
import { runScope } from './commands/scope';
import { runSnapshot } from './commands/snapshot';
import { runAudit } from './commands/audit';
import { runReport } from './commands/report';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json') as { version: string };

const program = new Command();

program
  .name('repoblackbox')
  .description('AI coding agents move fast. Your repo needs a blackbox.')
  .version(version);

program
  .command('init')
  .description('Create .repoblackbox/ config and safety documents in the current project')
  .option('-f, --force', 'Overwrite existing files')
  .action((options: { force?: boolean }) => {
    runInit(options);
  });

program
  .command('scope')
  .description('Define task boundaries before an AI agent edits your code')
  .option('--task <description>', 'Task description')
  .option('--allow <patterns>', 'Allowed file patterns (comma-separated)')
  .option('--forbid <patterns>', 'Forbidden file patterns (comma-separated)')
  .option('--success <criteria>', 'Success criteria')
  .action(async (options: { task?: string; allow?: string; forbid?: string; success?: string }) => {
    await runScope(options);
  });

program
  .command('snapshot <label>')
  .description('Capture current repo state before an AI agent starts working')
  .action((label: string) => {
    runSnapshot(label);
  });

program
  .command('audit')
  .description('Compare current repo state to latest snapshot and flag risky changes')
  .action(() => {
    runAudit();
  });

program
  .command('report')
  .description('Generate a human-readable AI coding run report in Markdown')
  .action(() => {
    runReport();
  });

program.parse(process.argv);
