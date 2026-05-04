import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { listSkillIds, loadSkill } from '../skills/loader';
import { parseVarsFromCli, findMissingRequired } from '../skills/variables';
import { renderSkill } from '../skills/renderer';
import { ensureDir } from '../utils/fs';
import { log, printBanner } from '../utils/render';

function runSkillList(): void {
  printBanner('skill list — Available skills');
  const ids = listSkillIds();
  if (ids.length === 0) {
    log.warn('No skills found.');
    return;
  }
  log.raw('Available skills:');
  for (const id of ids) {
    try {
      const skill = loadSkill(id);
      log.raw(`  - ${id}  —  ${skill?.metadata.title ?? '(no title)'}`);
    } catch {
      log.raw(`  - ${id}  —  (failed to parse)`);
    }
  }
  console.log();
  log.info('Show details:  repoblackbox skill show <skill>');
  log.info('Render:        repoblackbox skill use <skill> --var key=value');
  console.log();
}

function runSkillShow(skillId: string): void {
  printBanner(`skill show — ${skillId}`);
  let skill;
  try {
    skill = loadSkill(skillId);
  } catch (e) {
    log.error(`Invalid skill file: ${(e as Error).message}`);
    process.exit(1);
  }
  if (!skill) {
    log.error(`Unknown skill: ${skillId}`);
    log.info(`Available: ${listSkillIds().join(', ') || '(none)'}`);
    process.exit(1);
  }
  const m = skill.metadata;
  log.raw(`ID:              ${m.id}`);
  log.raw(`Title:           ${m.title}`);
  log.raw(`Description:     ${m.description}`);
  log.raw(`Target agents:   ${m.target_agents.join(', ') || '(any)'}`);
  log.raw(`Required vars:   ${m.required_variables.join(', ') || '(none)'}`);
  log.raw(`Optional vars:   ${m.optional_variables.join(', ') || '(none)'}`);
  log.raw('Safety notes:');
  if (m.safety.length === 0) {
    log.raw('  (none)');
  } else {
    for (const s of m.safety) log.raw(`  - ${s}`);
  }
  console.log();
  log.raw('--- Prompt preview (first 20 lines) ---');
  const preview = skill.body.split('\n').slice(0, 20).join('\n');
  log.raw(preview);
  console.log();
  log.info(`Render:  repoblackbox skill use ${skillId} --var ...`);
  console.log();
}

function runSkillUse(
  skillId: string,
  options: { var?: string[]; output?: string },
): void {
  let skill;
  try {
    skill = loadSkill(skillId);
  } catch (e) {
    log.error(`Invalid skill file: ${(e as Error).message}`);
    process.exit(1);
  }
  if (!skill) {
    log.error(`Unknown skill: ${skillId}`);
    log.info(`Available: ${listSkillIds().join(', ') || '(none)'}`);
    process.exit(1);
  }

  let vars: Record<string, string>;
  try {
    vars = parseVarsFromCli(options.var ?? []);
  } catch (e) {
    log.error((e as Error).message);
    process.exit(1);
  }

  const missing = findMissingRequired(skill.metadata.required_variables, vars);
  if (missing.length > 0) {
    log.error(`Missing required variables: ${missing.join(', ')}`);
    log.info('Example:');
    const example = missing.map(v => `--var ${v}=<value>`).join(' ');
    log.raw(`  repoblackbox skill use ${skillId} ${example}`);
    process.exit(1);
  }

  const rendered = renderSkill(skill, vars);

  if (options.output) {
    ensureDir(path.dirname(path.resolve(options.output)));
    fs.writeFileSync(options.output, rendered, 'utf8');
    log.success(`Skill prompt written: ${options.output}`);
  } else {
    process.stdout.write(rendered);
    if (!rendered.endsWith('\n')) process.stdout.write('\n');
  }
}

export function registerSkillCommand(program: Command): void {
  const skill = program
    .command('skill')
    .description('Agent Skill Packs — copy-paste workflow prompts for AI coding agents');

  skill
    .command('list')
    .description('List available skills')
    .action(() => runSkillList());

  skill
    .command('show <skill>')
    .description('Show skill metadata and prompt preview')
    .action((id: string) => runSkillShow(id));

  skill
    .command('use <skill>')
    .description('Render a skill prompt with --var substitutions')
    .option(
      '--var <kv>',
      'variable in key=value form (repeatable)',
      (val: string, prev: string[]) => {
        prev.push(val);
        return prev;
      },
      [] as string[],
    )
    .option('-o, --output <file>', 'write rendered prompt to file instead of stdout')
    .action((id: string, opts: { var: string[]; output?: string }) =>
      runSkillUse(id, opts),
    );
}
