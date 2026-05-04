import fs from 'fs';
import path from 'path';
import { TaskDefinition } from './types';
import { BENCHMARK_TASKS_DIR } from './paths';

export function listTaskIds(): string[] {
  if (!fs.existsSync(BENCHMARK_TASKS_DIR)) return [];
  return fs
    .readdirSync(BENCHMARK_TASKS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .filter(name => fs.existsSync(path.join(BENCHMARK_TASKS_DIR, name, 'task.json')))
    .sort();
}

export function loadTask(taskId: string): TaskDefinition | null {
  const taskPath = path.join(BENCHMARK_TASKS_DIR, taskId, 'task.json');
  if (!fs.existsSync(taskPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(taskPath, 'utf8')) as TaskDefinition;
  } catch {
    return null;
  }
}

export function taskFixtureDir(taskId: string): string {
  return path.join(BENCHMARK_TASKS_DIR, taskId, 'repo');
}

export function taskMdPath(taskId: string): string {
  return path.join(BENCHMARK_TASKS_DIR, taskId, 'TASK.md');
}
