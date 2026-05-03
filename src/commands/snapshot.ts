import path from 'path';
import { walkDir, writeJSON, fileExists, fileStats } from '../utils/fs';
import { hashFile } from '../utils/hash';
import { getGitInfo } from '../utils/git';
import { log, printBanner } from '../utils/render';
import { isSensitiveFile, shouldIgnoreForSnapshot, BLACKBOX_DIR, SNAPSHOTS_DIR } from '../utils/paths';
import { nowISO, nowTimestamp, slug } from '../utils/time';

const VERSION = '0.1.0';

interface FileEntry {
  sha256: string;
  size: number;
  mtimeMs: number;
}

interface SensitiveEntry {
  exists: boolean;
  size: number;
  mtimeMs: number;
  contentRead: false;
}

export interface SnapshotData {
  version: string;
  label: string;
  createdAt: string;
  cwd: string;
  git: {
    branch: string | null;
    commit: string | null;
    status: string | null;
    available: boolean;
  };
  files: Record<string, FileEntry>;
  sensitiveFiles: Record<string, SensitiveEntry>;
}

export function runSnapshot(label: string): void {
  printBanner(`snapshot — Capturing repo state: "${label}"`);

  if (!fileExists(BLACKBOX_DIR)) {
    log.error('.repoblackbox/ not found. Run "repoblackbox init" first.');
    process.exit(1);
  }

  const cwd = process.cwd();
  const git = getGitInfo();

  if (!git.available) {
    log.warn('Git not available or no commits yet. Continuing with file hashes only.');
  } else {
    log.info(`Branch: ${git.branch}  Commit: ${git.commit?.slice(0, 8)}`);
  }

  const files: Record<string, FileEntry> = {};
  const sensitiveFiles: Record<string, SensitiveEntry> = {};

  log.info('Walking directory...');

  const entries = walkDir(cwd, (rel) => shouldIgnoreForSnapshot(rel));

  let fileCount = 0;
  let sensitiveCount = 0;
  let errorCount = 0;

  for (const { rel, abs } of entries) {
    if (isSensitiveFile(rel)) {
      const stats = fileStats(abs);
      if (stats) {
        sensitiveFiles[rel] = {
          exists: true,
          size: stats.size,
          mtimeMs: stats.mtimeMs,
          contentRead: false,
        };
        sensitiveCount++;
      }
    } else {
      const stats = fileStats(abs);
      if (!stats) continue;
      try {
        const sha256 = hashFile(abs);
        files[rel] = { sha256, size: stats.size, mtimeMs: stats.mtimeMs };
        fileCount++;
      } catch {
        log.warn(`Could not hash: ${rel}`);
        errorCount++;
      }
    }
  }

  log.success(`Recorded ${fileCount} files, ${sensitiveCount} sensitive files`);
  if (errorCount > 0) log.warn(`${errorCount} files could not be read`);

  const createdAt = nowISO();
  const ts = nowTimestamp();
  const labelSlug = slug(label);

  const snapshot: SnapshotData = {
    version: VERSION,
    label,
    createdAt,
    cwd,
    git: {
      branch: git.branch,
      commit: git.commit,
      status: git.status,
      available: git.available,
    },
    files,
    sensitiveFiles,
  };

  const snapshotFile = path.join(SNAPSHOTS_DIR, `${ts}-${labelSlug}.json`);
  const latestFile = path.join(SNAPSHOTS_DIR, 'latest.json');

  writeJSON(snapshotFile, snapshot);
  writeJSON(latestFile, snapshot);

  log.success(`Saved snapshot: ${snapshotFile}`);
  log.success(`Updated: ${latestFile}`);

  console.log();
  log.info('Snapshot captured. Give the AI agent its task now.');
  log.info('When done, run: repoblackbox audit');
  console.log();
}
