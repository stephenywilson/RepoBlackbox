import fs from 'fs';
import path from 'path';
import { hashFile } from '../utils/hash';
import { Baseline } from './types';

const IGNORE_PREFIXES = ['.git/', 'node_modules/', '.DS_Store'];

function shouldIgnore(rel: string): boolean {
  if (rel === '.DS_Store') return true;
  return IGNORE_PREFIXES.some(p => rel.startsWith(p));
}

export function hashWorkspace(repoDir: string): Record<string, string> {
  const out: Record<string, string> = {};

  function walk(current: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      const rel = path.relative(repoDir, abs).replace(/\\/g, '/');
      if (shouldIgnore(rel)) continue;
      if (entry.isDirectory()) {
        walk(abs);
      } else if (entry.isFile()) {
        try {
          out[rel] = hashFile(abs);
        } catch {
          // skip unreadable
        }
      }
    }
  }

  walk(repoDir);
  return out;
}

export interface DiffResult {
  changed: string[];
  added: string[];
  deleted: string[];
}

export function diffAgainstBaseline(repoDir: string, baseline: Baseline): DiffResult {
  const current = hashWorkspace(repoDir);
  const changed: string[] = [];
  const added: string[] = [];
  const deleted: string[] = [];

  for (const [rel, hash] of Object.entries(current)) {
    const prev = baseline.files[rel];
    if (!prev) added.push(rel);
    else if (prev.sha256 !== hash) changed.push(rel);
  }
  for (const rel of Object.keys(baseline.files)) {
    if (!(rel in current)) deleted.push(rel);
  }

  return { changed: changed.sort(), added: added.sort(), deleted: deleted.sort() };
}
