import path from 'path';
import { walkDir, readJSON, writeJSON, writeFile, fileStats } from '../utils/fs';
import { hashFile } from '../utils/hash';
import { getGitInfo, getGitDiffNumstat } from '../utils/git';
import { classifyFileRisk, computeRiskLevel, RiskLevel, RiskFlags } from '../utils/risk';
import { isSensitiveFile, shouldIgnoreForSnapshot, LATEST_SNAPSHOT, LATEST_SCOPE_JSON, REPORTS_DIR } from '../utils/paths';
import { matchesAnyPattern } from '../utils/pattern';
import { log, printBanner, riskBadge } from '../utils/render';
import { nowISO, nowTimestamp } from '../utils/time';
import { SnapshotData } from './snapshot';
import { ScopeData } from './scope';

export interface AuditResult {
  version: string;
  auditedAt: string;
  snapshotLabel: string;
  snapshotCreatedAt: string;
  git: {
    branch: string | null;
    commit: string | null;
    available: boolean;
  };
  added: string[];
  modified: string[];
  deleted: string[];
  sensitiveFilesTouched: string[];
  highRiskFiles: string[];
  mediumRiskFiles: string[];
  scopeViolations: string[];
  outOfScopeFiles: string[];
  riskLevel: RiskLevel;
  largeChange: boolean;
  flags: string[];
}

function parseLargeChange(numstat: string | null): boolean {
  if (!numstat) return false;
  let total = 0;
  for (const line of numstat.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2) {
      total += (parseInt(parts[0]) || 0) + (parseInt(parts[1]) || 0);
    }
  }
  return total > 500;
}

export function runAudit(): void {
  printBanner('audit — Comparing current state to latest snapshot');

  const snapshot = readJSON<SnapshotData>(LATEST_SNAPSHOT);
  if (!snapshot) {
    log.error('No snapshot found. Run "repoblackbox snapshot \\"label\\"" first.');
    process.exit(1);
  }

  log.info(`Snapshot: "${snapshot.label}" from ${snapshot.createdAt}`);

  const cwd = process.cwd();
  const git = getGitInfo();

  if (!git.available) {
    log.warn('Git not available. Using file hash comparison only.');
  }

  // Load scope JSON if it exists — used for pattern matching
  const scope = readJSON<ScopeData>(LATEST_SCOPE_JSON);
  if (scope) {
    log.info(`Scope loaded — forbidden: ${scope.forbidden.length} pattern(s), allowed: ${scope.allowed.length} pattern(s)`);
  }

  // Walk current state
  const currentFiles = new Map<string, { sha256: string; size: number; mtimeMs: number }>();
  const currentSensitive = new Map<string, { size: number; mtimeMs: number }>();

  const entries = walkDir(cwd, (rel) => shouldIgnoreForSnapshot(rel));

  for (const { rel, abs } of entries) {
    if (isSensitiveFile(rel)) {
      const stats = fileStats(abs);
      if (stats) currentSensitive.set(rel, { size: stats.size, mtimeMs: stats.mtimeMs });
    } else {
      const stats = fileStats(abs);
      if (!stats) continue;
      try {
        const sha256 = hashFile(abs);
        currentFiles.set(rel, { sha256, size: stats.size, mtimeMs: stats.mtimeMs });
      } catch {
        // skip unreadable files
      }
    }
  }

  // Diff against snapshot
  const added: string[] = [];
  const modified: string[] = [];
  const deleted: string[] = [];
  const sensitiveFilesTouched: string[] = [];

  for (const [rel, curr] of currentFiles) {
    const prev = snapshot.files[rel];
    if (!prev) {
      added.push(rel);
    } else if (prev.sha256 !== curr.sha256) {
      modified.push(rel);
    }
  }

  for (const rel of Object.keys(snapshot.files)) {
    if (!currentFiles.has(rel)) {
      deleted.push(rel);
    }
  }

  // Check sensitive files
  for (const [rel, curr] of currentSensitive) {
    const prev = snapshot.sensitiveFiles[rel];
    if (!prev) {
      sensitiveFilesTouched.push(`${rel} (ADDED)`);
    } else if (prev.size !== curr.size || Math.abs(prev.mtimeMs - curr.mtimeMs) > 1000) {
      sensitiveFilesTouched.push(`${rel} (MODIFIED — size or mtime changed)`);
    }
  }
  for (const rel of Object.keys(snapshot.sensitiveFiles)) {
    if (!currentSensitive.has(rel)) {
      sensitiveFilesTouched.push(`${rel} (DELETED)`);
    }
  }

  const allChanged = [...added, ...modified, ...deleted];

  // Built-in risk classification
  const highRiskFiles = allChanged.filter(f => classifyFileRisk(f) === 'HIGH');
  const mediumRiskFiles = allChanged.filter(f => classifyFileRisk(f) === 'MEDIUM');

  // Scope-aware pattern matching
  const scopeViolations: string[] = [];
  const outOfScopeFiles: string[] = [];

  if (scope) {
    for (const f of allChanged) {
      if (scope.forbidden.length > 0 && matchesAnyPattern(f, scope.forbidden)) {
        scopeViolations.push(`Scope violation: "${f}" matches forbidden pattern`);
      }
    }

    // Only flag out-of-scope if allowed patterns were explicitly declared
    if (scope.allowed.length > 0) {
      for (const f of allChanged) {
        const isForbiddenViolation = scopeViolations.some(v => v.includes(`"${f}"`));
        if (!isForbiddenViolation && !matchesAnyPattern(f, scope.allowed)) {
          outOfScopeFiles.push(f);
        }
      }
    }
  }

  // Large-change detection via git numstat
  let largeChange = false;
  if (git.available && snapshot.git.commit) {
    largeChange = parseLargeChange(getGitDiffNumstat(snapshot.git.commit));
  }

  const riskFlags: RiskFlags = {
    highFiles: highRiskFiles,
    mediumFiles: mediumRiskFiles,
    deletedCount: deleted.length,
    largeChange,
    scopeViolationCount: scopeViolations.length,
    outOfScopeCount: outOfScopeFiles.length,
  };

  const riskLevel = computeRiskLevel(riskFlags);

  // Build human-readable flag messages
  const flagMessages: string[] = [];

  if (sensitiveFilesTouched.length > 0) {
    flagMessages.push(`Sensitive files touched: ${sensitiveFilesTouched.join(', ')}`);
  }
  if (highRiskFiles.length > 0) {
    flagMessages.push(`High-risk files changed: ${highRiskFiles.join(', ')}`);
  }
  if (mediumRiskFiles.length > 0) {
    flagMessages.push(`Dependency/config files changed: ${mediumRiskFiles.join(', ')}`);
  }
  if (deleted.length > 10) {
    flagMessages.push(`Large number of files deleted: ${deleted.length}`);
  }
  if (largeChange) {
    flagMessages.push('Large code change detected (>500 lines added/deleted)');
  }
  scopeViolations.forEach(v => flagMessages.push(v));
  if (outOfScopeFiles.length > 0) {
    flagMessages.push(`Changed file outside declared allowed scope: ${outOfScopeFiles.join(', ')}`);
  }

  // Print terminal output
  log.section('Changes');
  if (allChanged.length === 0) {
    log.info('No changes detected.');
  } else {
    if (added.length > 0) {
      log.raw(`  Added    (${added.length}):`);
      added.forEach(f => log.raw(`    + ${f}`));
    }
    if (modified.length > 0) {
      log.raw(`  Modified (${modified.length}):`);
      modified.forEach(f => log.raw(`    ~ ${f}`));
    }
    if (deleted.length > 0) {
      log.raw(`  Deleted  (${deleted.length}):`);
      deleted.forEach(f => log.raw(`    - ${f}`));
    }
  }

  if (sensitiveFilesTouched.length > 0) {
    log.section('Sensitive Files');
    sensitiveFilesTouched.forEach(f => log.warn(f));
  }

  if (scopeViolations.length > 0) {
    log.section('Scope Violations');
    scopeViolations.forEach(v => log.warn(v));
  }

  if (outOfScopeFiles.length > 0) {
    log.section('Out-of-Scope Changes');
    outOfScopeFiles.forEach(f => log.warn(`"${f}" is outside declared allowed patterns`));
  }

  if (flagMessages.length > 0) {
    log.section('Risk Flags');
    flagMessages.forEach(f => log.warn(f));
  }

  log.section(`Risk Level: ${riskBadge(riskLevel)}`);
  console.log();

  const auditResult: AuditResult = {
    version: '0.1.1',
    auditedAt: nowISO(),
    snapshotLabel: snapshot.label,
    snapshotCreatedAt: snapshot.createdAt,
    git: {
      branch: git.branch,
      commit: git.commit,
      available: git.available,
    },
    added,
    modified,
    deleted,
    sensitiveFilesTouched,
    highRiskFiles,
    mediumRiskFiles,
    scopeViolations,
    outOfScopeFiles,
    riskLevel,
    largeChange,
    flags: flagMessages,
  };

  const ts = nowTimestamp();
  const auditMd = buildAuditMarkdown(auditResult);

  writeJSON(path.join(REPORTS_DIR, `${ts}-audit.json`), auditResult);
  writeJSON(path.join(REPORTS_DIR, 'latest-audit.json'), auditResult);
  writeFile(path.join(REPORTS_DIR, `${ts}-audit.md`), auditMd);
  writeFile(path.join(REPORTS_DIR, 'latest-audit.md'), auditMd);

  log.success(`Audit saved to ${REPORTS_DIR}/`);

  if (riskLevel === 'HIGH') {
    log.warn('HIGH risk detected — stop and manually review before continuing.');
  } else if (riskLevel === 'MEDIUM') {
    log.warn('MEDIUM risk — inspect changes carefully before proceeding.');
  } else {
    log.info('LOW risk — review diff and run build/test to confirm.');
  }

  log.info('Run "repoblackbox report" to generate a full review report.');
  console.log();
}

function buildAuditMarkdown(r: AuditResult): string {
  const lines: string[] = [];
  lines.push('# RepoBlackbox Audit Report');
  lines.push('');
  lines.push(`**Snapshot:** ${r.snapshotLabel}`);
  lines.push(`**Snapshot created:** ${r.snapshotCreatedAt}`);
  lines.push(`**Audited at:** ${r.auditedAt}`);
  lines.push(`**Branch:** ${r.git.branch ?? 'unknown'}`);
  lines.push(`**Commit:** ${r.git.commit?.slice(0, 8) ?? 'unknown'}`);
  lines.push(`**Risk level:** ${r.riskLevel}`);
  lines.push('');

  lines.push('## Changes');
  lines.push('');

  if (r.added.length > 0) {
    lines.push(`### Added (${r.added.length})`);
    r.added.forEach(f => lines.push(`- \`${f}\``));
    lines.push('');
  }
  if (r.modified.length > 0) {
    lines.push(`### Modified (${r.modified.length})`);
    r.modified.forEach(f => lines.push(`- \`${f}\``));
    lines.push('');
  }
  if (r.deleted.length > 0) {
    lines.push(`### Deleted (${r.deleted.length})`);
    r.deleted.forEach(f => lines.push(`- \`${f}\``));
    lines.push('');
  }
  if (r.added.length === 0 && r.modified.length === 0 && r.deleted.length === 0) {
    lines.push('No changes detected.');
    lines.push('');
  }

  if (r.sensitiveFilesTouched.length > 0) {
    lines.push('## Sensitive Files Touched');
    r.sensitiveFilesTouched.forEach(f => lines.push(`- ${f}`));
    lines.push('');
  }

  if (r.scopeViolations.length > 0) {
    lines.push('## Scope Violations');
    r.scopeViolations.forEach(v => lines.push(`- ⛔ ${v}`));
    lines.push('');
  }

  if (r.outOfScopeFiles.length > 0) {
    lines.push('## Out-of-Scope Changes');
    r.outOfScopeFiles.forEach(f => lines.push(`- ⚠️  \`${f}\` is outside declared allowed patterns`));
    lines.push('');
  }

  if (r.flags.length > 0) {
    lines.push('## Risk Flags');
    r.flags.forEach(f => lines.push(`- ${f}`));
    lines.push('');
  } else {
    lines.push('## Risk Flags');
    lines.push('None.');
    lines.push('');
  }

  return lines.join('\n');
}
