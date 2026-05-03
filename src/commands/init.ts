import fs from 'fs';
import path from 'path';
import { ensureDir, writeJSON, writeFile, fileExists } from '../utils/fs';
import { log, printBanner } from '../utils/render';
import {
  BLACKBOX_DIR,
  SNAPSHOTS_DIR,
  REPORTS_DIR,
  RUNS_DIR,
  CONFIG_FILE,
  PROTECTED_JSON,
  ROOT_DOCS,
  DEFAULT_PROTECTED_PATTERNS,
} from '../utils/paths';
import { nowISO } from '../utils/time';

function templatePath(name: string): string {
  return path.join(__dirname, '../../templates', name);
}

function readTemplate(name: string): string {
  try {
    return fs.readFileSync(templatePath(name), 'utf8');
  } catch {
    return `# ${name}\n\n(Template not found — please reinstall repoblackbox)\n`;
  }
}

export function runInit(options: { force?: boolean }): void {
  printBanner('init — Setting up RepoBlackbox');

  // Create .repoblackbox/ subdirectories
  for (const dir of [BLACKBOX_DIR, SNAPSHOTS_DIR, REPORTS_DIR, RUNS_DIR]) {
    ensureDir(dir);
    log.success(`Created ${dir}/`);
  }

  // Write config.json
  if (!fileExists(CONFIG_FILE) || options.force) {
    writeJSON(CONFIG_FILE, {
      version: '0.1.0',
      createdAt: nowISO(),
      project: path.basename(process.cwd()),
    });
    log.success(`Created ${CONFIG_FILE}`);
  } else {
    log.skip(`skipped existing file: ${CONFIG_FILE}`);
  }

  // Write protected-files.json
  if (!fileExists(PROTECTED_JSON) || options.force) {
    writeJSON(PROTECTED_JSON, { patterns: DEFAULT_PROTECTED_PATTERNS });
    log.success(`Created ${PROTECTED_JSON}`);
  } else {
    log.skip(`skipped existing file: ${PROTECTED_JSON}`);
  }

  // Write root doc files from templates
  for (const docName of ROOT_DOCS) {
    if (!fileExists(docName) || options.force) {
      const content = readTemplate(docName);
      writeFile(docName, content);
      log.success(`Created ${docName}`);
    } else {
      log.skip(`skipped existing file: ${docName}`);
    }
  }

  console.log();
  log.info('Next steps:');
  log.raw('  1. Edit AGENT_RULES.md — rules the AI agent must follow');
  log.raw('  2. Edit PROJECT_CONTEXT.md — describe your project');
  log.raw('  3. Edit PROTECTED_FILES.md — list files the agent must not touch');
  log.raw('  4. Run: repoblackbox scope — define your task before each AI session');
  log.raw('  5. Run: repoblackbox snapshot "before <task>" — capture state');
  console.log();
}
