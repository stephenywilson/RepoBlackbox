import { execSync } from 'child_process';

export interface GitInfo {
  branch: string | null;
  commit: string | null;
  status: string | null;
  available: boolean;
}

function run(cmd: string): string | null {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

export function getGitInfo(): GitInfo {
  const branch = run('git rev-parse --abbrev-ref HEAD');
  const commit = run('git rev-parse HEAD');
  const status = run('git status --porcelain');
  return {
    branch,
    commit,
    status,
    available: branch !== null,
  };
}

export function getGitDiffNumstat(commit: string): string | null {
  return run(`git diff --numstat ${commit}`);
}
