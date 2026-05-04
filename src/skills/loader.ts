import fs from 'fs';
import path from 'path';
import { parseSkill } from './parser';
import { SkillFile } from './types';

// At runtime, this resolves to <package_root>/skills/.
// From dist/skills/loader.js: __dirname == <pkg>/dist/skills/.
export const SKILLS_DIR = path.resolve(__dirname, '..', '..', 'skills');

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
  // Default id to filename if frontmatter omits it
  if (!parsed.metadata.id) parsed.metadata.id = skillId;
  return { metadata: parsed.metadata, body: parsed.body, filePath };
}
