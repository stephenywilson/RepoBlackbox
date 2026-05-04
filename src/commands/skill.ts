import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import {
  listSkillIds,
  listLocalSkillIds,
  resolveSkill,
  getLocalSkillsDir,
  SkillSource,
} from '../skills/loader';
import { parseVarsFromCli, findMissingRequired } from '../skills/variables';
import { renderSkill } from '../skills/renderer';
import { ensureDir } from '../utils/fs';
import { log, printBanner } from '../utils/render';
import { runSkillInit } from '../skills/init';

// ── skill list ──────────────────────────────────────────────────────

interface ListOptions {
  builtIn?: boolean;
  local?: boolean;
  all?: boolean;
  skillsDir?: string;
}

function runSkillList(options: ListOptions): void {
  printBanner('skill list — Skills');

  const showBuiltIn = options.builtIn || options.all || (!options.local);
  const showLocal = options.local || options.all || (!options.builtIn);

  if (showBuiltIn) {
    const ids = listSkillIds();
    log.raw(`Built-in skills (${ids.length}):`);
    if (ids.length === 0) {
      log.raw('  (none)');
    } else {
      for (const id of ids) {
        try {
          const r = resolveSkill(id, 'built-in');
          log.raw(`  - ${id}  —  ${r?.skill.metadata.title ?? '(no title)'}`);
        } catch {
          log.raw(`  - ${id}  —  (failed to parse)`);
        }
      }
    }
    console.log();
  }

  if (showLocal) {
    const localDir = getLocalSkillsDir(options.skillsDir);
    const ids = listLocalSkillIds(options.skillsDir);
    if (ids.length > 0) {
      log.raw(`Local skills (${ids.length}):`);
      for (const id of ids) {
        try {
          const r = resolveSkill(id, 'local', options.skillsDir);
          log.raw(`  - ${id}  —  ${r?.skill.metadata.title ?? '(no title)'}`);
        } catch {
          log.raw(`  - ${id}  —  (failed to parse)`);
        }
      }
      console.log();
    } else if (options.local) {
      // Only complain if --local was explicitly requested
      log.warn(`No local skills found in: ${localDir}`);
      log.info('Run: repoblackbox skill init');
      console.log();
    }
  }

  log.info('Show details:  repoblackbox skill show <skill>');
  log.info('Render:        repoblackbox skill use <skill> --var key=value');
  log.info('Init local:    repoblackbox skill init');
  console.log();
}

// ── skill show ──────────────────────────────────────────────────────

interface ShowOptions {
  builtIn?: boolean;
  local?: boolean;
  skillsDir?: string;
}

function runSkillShow(skillId: string, options: ShowOptions): void {
  printBanner(`skill show — ${skillId}`);

  const source: SkillSource = options.builtIn ? 'built-in' : options.local ? 'local' : 'auto';
  let resolved;
  try {
    resolved = resolveSkill(skillId, source, options.skillsDir);
  } catch (e) {
    log.error(`Invalid skill file: ${(e as Error).message}`);
    process.exit(1);
  }

  if (!resolved) {
    const searchedIn = options.builtIn
      ? 'built-in skills'
      : options.local
      ? `local skills (${getLocalSkillsDir(options.skillsDir)})`
      : 'local + built-in skills';
    log.error(`Skill "${skillId}" not found in ${searchedIn}.`);
    log.info('List available skills: repoblackbox skill list');
    if (!options.local) log.info('Create a local skill: repoblackbox skill init');
    process.exit(1);
  }

  if (resolved.isOverride) {
    log.info(`Using local skill override: ${skillId}`);
  }

  const m = resolved.skill.metadata;
  log.raw(`ID:              ${m.id}`);
  log.raw(`Source:          ${resolved.source}`);
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
  const preview = resolved.skill.body.split('\n').slice(0, 20).join('\n');
  log.raw(preview);
  console.log();
  log.info(`Render:  repoblackbox skill use ${skillId} --var ...`);
  console.log();
}

// ── skill use ───────────────────────────────────────────────────────

interface UseOptions {
  var?: string[];
  output?: string;
  builtIn?: boolean;
  local?: boolean;
  skillsDir?: string;
}

function runSkillUse(skillId: string, options: UseOptions): void {
  const source: SkillSource = options.builtIn ? 'built-in' : options.local ? 'local' : 'auto';
  let resolved;
  try {
    resolved = resolveSkill(skillId, source, options.skillsDir);
  } catch (e) {
    log.error(`Invalid skill file: ${(e as Error).message}`);
    process.exit(1);
  }

  if (!resolved) {
    const searchedIn = options.builtIn
      ? 'built-in skills'
      : options.local
      ? `local skills (${getLocalSkillsDir(options.skillsDir)})`
      : 'local + built-in skills';
    log.error(`Skill "${skillId}" not found in ${searchedIn}.`);
    log.info('List available skills: repoblackbox skill list');
    if (!options.local) log.info('Create a local skill: repoblackbox skill init');
    process.exit(1);
  }

  if (resolved.isOverride) {
    log.warn(`Using local skill override: ${skillId}`);
  }

  let vars: Record<string, string>;
  try {
    vars = parseVarsFromCli(options.var ?? []);
  } catch (e) {
    log.error((e as Error).message);
    process.exit(1);
  }

  const missing = findMissingRequired(resolved.skill.metadata.required_variables, vars);
  if (missing.length > 0) {
    log.error(`Missing required variables: ${missing.join(', ')}`);
    log.info('Example:');
    const example = missing.map(v => `--var ${v}=<value>`).join(' ');
    log.raw(`  repoblackbox skill use ${skillId} ${example}`);
    process.exit(1);
  }

  const rendered = renderSkill(resolved.skill, vars);

  if (options.output) {
    ensureDir(path.dirname(path.resolve(options.output)));
    fs.writeFileSync(options.output, rendered, 'utf8');
    log.success(`Skill prompt written: ${options.output}`);
  } else {
    process.stdout.write(rendered);
    if (!rendered.endsWith('\n')) process.stdout.write('\n');
  }
}

// ── Commander registration ──────────────────────────────────────────

export function registerSkillCommand(program: Command): void {
  const skill = program
    .command('skill')
    .description(
      'Agent Skill Packs — copy-paste workflow prompts for AI coding agents',
    );

  skill
    .command('init')
    .description('Create local skill directory and example skill')
    .option('-f, --force', 'Overwrite existing example-custom-skill.md')
    .option('--skills-dir <path>', 'Custom local skill directory path')
    .action((opts: { force?: boolean; skillsDir?: string }) =>
      runSkillInit({ force: opts.force, customDir: opts.skillsDir }),
    );

  skill
    .command('list')
    .description('List built-in and/or local skills')
    .option('--built-in', 'Show only built-in skills')
    .option('--local', 'Show only local skills')
    .option('--all', 'Show built-in and local skills')
    .option('--skills-dir <path>', 'Custom local skill directory path')
    .action(
      (opts: {
        builtIn?: boolean;
        local?: boolean;
        all?: boolean;
        skillsDir?: string;
      }) => runSkillList(opts),
    );

  skill
    .command('show <skill>')
    .description('Show skill metadata and prompt preview')
    .option('--built-in', 'Only search built-in skills')
    .option('--local', 'Only search local skills')
    .option('--skills-dir <path>', 'Custom local skill directory path')
    .action(
      (id: string, opts: { builtIn?: boolean; local?: boolean; skillsDir?: string }) =>
        runSkillShow(id, opts),
    );

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
    .option('--built-in', 'Only search built-in skills')
    .option('--local', 'Only search local skills')
    .option('--skills-dir <path>', 'Custom local skill directory path')
    .action(
      (
        id: string,
        opts: {
          var: string[];
          output?: string;
          builtIn?: boolean;
          local?: boolean;
          skillsDir?: string;
        },
      ) => runSkillUse(id, opts),
    );
}
