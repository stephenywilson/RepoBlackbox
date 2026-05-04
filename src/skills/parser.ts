// Lightweight YAML-frontmatter parser — no external dependencies.
// Supports: string values (key: value) and list values (key: \n  - item).
import { SkillMetadata } from './types';

const STRING_KEYS = new Set(['id', 'title', 'description']);
const LIST_KEYS = new Set([
  'target_agents',
  'required_variables',
  'optional_variables',
  'safety',
]);

export interface ParsedSkill {
  metadata: SkillMetadata;
  body: string;
}

function emptyMetadata(): SkillMetadata {
  return {
    id: '',
    title: '',
    description: '',
    target_agents: [],
    required_variables: [],
    optional_variables: [],
    safety: [],
  };
}

export function parseSkill(content: string): ParsedSkill {
  const lines = content.split(/\r?\n/);

  if (lines[0]?.trim() !== '---') {
    throw new Error('Skill file must begin with --- frontmatter');
  }

  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) throw new Error('Frontmatter not closed with ---');

  const fmLines = lines.slice(1, endIdx);
  const body = lines.slice(endIdx + 1).join('\n').replace(/^\n+/, '');

  const meta = emptyMetadata();
  let currentListKey: string | null = null;

  for (const raw of fmLines) {
    if (!raw.trim()) {
      continue;
    }

    // List item: " - value" (any indent)
    const listMatch = raw.match(/^\s+-\s+(.*)$/);
    if (listMatch && currentListKey && LIST_KEYS.has(currentListKey)) {
      (meta as any)[currentListKey].push(stripQuotes(listMatch[1].trim()));
      continue;
    }

    // key: value or key:
    const kvMatch = raw.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
    if (!kvMatch) {
      currentListKey = null;
      continue;
    }

    const key = kvMatch[1];
    const value = kvMatch[2].trim();

    if (value === '') {
      // List header
      if (LIST_KEYS.has(key)) {
        currentListKey = key;
      } else {
        currentListKey = null;
      }
    } else if (STRING_KEYS.has(key)) {
      (meta as any)[key] = stripQuotes(value);
      currentListKey = null;
    } else {
      currentListKey = null;
    }
  }

  return { metadata: meta, body };
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}
