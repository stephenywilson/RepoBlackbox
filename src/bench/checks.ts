import fs from 'fs';
import path from 'path';
import { CheckDefinition, CheckResult, Baseline } from './types';
import { matchesPattern } from '../utils/pattern';
import { DiffResult } from './diff';

interface CheckContext {
  repoDir: string;
  baseline: Baseline;
  diff: DiffResult;
}

function readFileSafe(repoDir: string, rel: string): string | null {
  try {
    return fs.readFileSync(path.join(repoDir, rel), 'utf8');
  } catch {
    return null;
  }
}

function fileExists(repoDir: string, rel: string): boolean {
  return fs.existsSync(path.join(repoDir, rel));
}

function pass(c: CheckDefinition, detail?: string): CheckResult {
  return {
    id: c.id,
    description: c.description,
    type: c.type,
    points: c.points,
    passed: true,
    detail,
  };
}

function fail(c: CheckDefinition, detail: string): CheckResult {
  return {
    id: c.id,
    description: c.description,
    type: c.type,
    points: c.points,
    passed: false,
    detail,
  };
}

export function runCheck(c: CheckDefinition, ctx: CheckContext): CheckResult {
  switch (c.type) {
    case 'file_contains': {
      if (!c.file || !c.pattern) return fail(c, 'check missing file or pattern');
      const content = readFileSafe(ctx.repoDir, c.file);
      if (content === null) return fail(c, `${c.file} not found`);
      return content.includes(c.pattern)
        ? pass(c, `${c.file} contains expected pattern`)
        : fail(c, `${c.file} does not contain "${c.pattern}"`);
    }

    case 'file_not_contains': {
      if (!c.file || !c.pattern) return fail(c, 'check missing file or pattern');
      const content = readFileSafe(ctx.repoDir, c.file);
      if (content === null) return pass(c, `${c.file} not present`);
      return !content.includes(c.pattern)
        ? pass(c, `${c.file} does not contain forbidden pattern`)
        : fail(c, `${c.file} still contains "${c.pattern}"`);
    }

    case 'file_exists': {
      if (!c.file) return fail(c, 'check missing file');
      return fileExists(ctx.repoDir, c.file)
        ? pass(c, `${c.file} exists`)
        : fail(c, `${c.file} does not exist`);
    }

    case 'file_unchanged': {
      if (!c.file) return fail(c, 'check missing file');
      const wasChanged =
        ctx.diff.changed.includes(c.file) ||
        ctx.diff.deleted.includes(c.file);
      return wasChanged
        ? fail(c, `${c.file} was modified or deleted`)
        : pass(c, `${c.file} unchanged`);
    }

    case 'file_changed': {
      if (!c.file) return fail(c, 'check missing file');
      const wasChanged = ctx.diff.changed.includes(c.file);
      return wasChanged
        ? pass(c, `${c.file} was modified`)
        : fail(c, `${c.file} was not modified`);
    }

    case 'pattern_absent': {
      if (!c.pattern) return fail(c, 'check missing pattern');
      const allFiles = [
        ...Object.keys(ctx.baseline.files),
        ...ctx.diff.added,
      ];
      const offenders: string[] = [];
      for (const rel of allFiles) {
        const content = readFileSafe(ctx.repoDir, rel);
        if (content && content.includes(c.pattern)) offenders.push(rel);
      }
      return offenders.length === 0
        ? pass(c, 'pattern not found in any file')
        : fail(c, `pattern still present in: ${offenders.join(', ')}`);
    }

    case 'forbidden_untouched': {
      const patterns = c.files ?? (c.file ? [c.file] : []);
      if (patterns.length === 0) return fail(c, 'check missing files/file');
      const allTouched = [...ctx.diff.changed, ...ctx.diff.added, ...ctx.diff.deleted];
      const violations = allTouched.filter(f =>
        patterns.some(p => matchesPattern(f, p))
      );
      return violations.length === 0
        ? pass(c, 'no forbidden files touched')
        : fail(c, `forbidden files modified: ${violations.join(', ')}`);
    }

    case 'max_changed_files': {
      const max = c.max ?? 1;
      const total = ctx.diff.changed.length + ctx.diff.added.length + ctx.diff.deleted.length;
      return total <= max
        ? pass(c, `${total} file(s) changed (limit ${max})`)
        : fail(c, `${total} file(s) changed exceeds limit ${max}`);
    }

    default:
      return fail(c, `unknown check type: ${c.type}`);
  }
}
