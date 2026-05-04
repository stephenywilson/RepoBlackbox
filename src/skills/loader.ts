import fs from 'fs';
import path from 'path';
import { parseSkill } from './parser';
import { SkillFile } from './types';

// Built-in skills ship with the package.
// From dist/skills/loader.js: __dirname == <pkg>/dist/skills/.
export const SKILLS_DIR = path.resolve(__dirname, '..', '..', 'skills');

// ── Built-in skill helpers ──────────────────────────────────────────

export function listSkillIds(): string[] {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs
    .readdirSync(SKILLS_DIR)
    .filter(name => name.endsWith('.md'))
    .map(name => name.replace(/\.md$/, ''))
    .sort();
}

export function loadSkill(skillId: string): SkillFile | null {
  const filePath = path.join(SKILLS_DIR, `${skillId}.md`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = parseSkill(content);
  if (!parsed.metadata.id) parsed.metadata.id = skillId;
  return { metadata: parsed.metadata, body: parsed.body, filePath };
}

// ── Local skill helpers ─────────────────────────────────────────────

// Returns the path to the local skill directory.
// Priority: explicit customDir → .repoblackbox/skills/ in CWD.
export function getLocalSkillsDir(customDir?: string): string {
  if (customDir) return path.resolve(customDir);
  return path.join(process.cwd(), '.repoblackbox', 'skills');
}

export function listLocalSkillIds(customDir?: string): string[] {
  const dir = getLocalSkillsDir(customDir);
  if (!fs.existsSync(dir)) return [];
  const ids: string[] = [];
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const id = name.replace(/\.md$/, '');
    try {
      // Quick parse check — skip invalid files
      const content = fs.readFileSync(path.join(dir, name), 'utf8');
      parseSkill(content);
      ids.push(id);
    } catch {
      // Skip malformed skill files for list
    }
  }
  return ids.sort();
}

export function loadLocalSkill(skillId: string, customDir?: string): SkillFile | null {
  const dir = getLocalSkillsDir(customDir);
  const filePath = path.join(dir, `${skillId}.md`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = parseSkill(content);
  if (!parsed.metadata.id) parsed.metadata.id = skillId;
  return { metadata: parsed.metadata, body: parsed.body, filePath };
}

// ── Resolver ────────────────────────────────────────────────────────

export interface ResolvedSkill {
  skill: SkillFile;
  source: 'built-in' | 'local';
  isOverride: boolean; // local overriding a built-in with same id
}

export type SkillSource = 'built-in' | 'local' | 'auto';

export function resolveSkill(
  skillId: string,
  source: SkillSource,
  customDir?: string,
): ResolvedSkill | null {
  if (source === 'built-in') {
    const skill = loadSkill(skillId);
    return skill ? { skill, source: 'built-in', isOverride: false } : null;
  }

  if (source === 'local') {
    const skill = loadLocalSkill(skillId, customDir);
    return skill ? { skill, source: 'local', isOverride: false } : null;
  }

  // auto: local-first, then built-in
  const local = loadLocalSkill(skillId, customDir);
  if (local) {
    const builtInExists = loadSkill(skillId) !== null;
    return { skill: local, source: 'local', isOverride: builtInExists };
  }
  const builtin = loadSkill(skillId);
  return builtin ? { skill: builtin, source: 'built-in', isOverride: false } : null;
}
