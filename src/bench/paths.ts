import path from 'path';
import { BLACKBOX_DIR } from '../utils/paths';

// Located at <package_root>/benchmark — ships with the npm package.
// From dist/bench/paths.js, two levels up == package root.
export const BENCHMARK_DIR = path.resolve(__dirname, '..', '..', 'benchmark');
export const BENCHMARK_TASKS_DIR = path.join(BENCHMARK_DIR, 'tasks');

// Located in user's CWD — per-project, alongside snapshots/reports.
export const BENCH_DIR = path.join(BLACKBOX_DIR, 'bench');
export const BENCH_WORKSPACES_DIR = path.join(BENCH_DIR, 'workspaces');
export const BENCH_REPORTS_DIR = path.join(BENCH_DIR, 'reports');

export function workspaceDir(taskId: string): string {
  return path.join(BENCH_WORKSPACES_DIR, taskId);
}

export function workspaceRepoDir(taskId: string): string {
  return path.join(workspaceDir(taskId), 'repo');
}

export function workspaceBaselinePath(taskId: string): string {
  return path.join(workspaceDir(taskId), 'baseline.json');
}

export function workspaceTaskMdPath(taskId: string): string {
  return path.join(workspaceDir(taskId), 'TASK.md');
}

export function workspaceExpectedPath(taskId: string): string {
  return path.join(workspaceDir(taskId), 'expected.json');
}
