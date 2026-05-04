export type CheckType =
  | 'file_contains'
  | 'file_not_contains'
  | 'file_exists'
  | 'file_unchanged'
  | 'file_changed'
  | 'pattern_absent'
  | 'forbidden_untouched'
  | 'max_changed_files';

export interface CheckDefinition {
  id: string;
  description: string;
  type: CheckType;
  points: number;
  file?: string;
  files?: string[];
  pattern?: string;
  expected?: string;
  max?: number;
}

export interface TaskDefinition {
  id: string;
  title: string;
  description: string;
  instructions: string;
  required_files: string[];
  forbidden_files: string[];
  checks: CheckDefinition[];
  scoring: {
    max: number;
    passing: number;
  };
  notes?: string;
}

export interface BaselineEntry {
  sha256: string;
}

export interface Baseline {
  createdAt: string;
  files: Record<string, BaselineEntry>;
}

export interface CheckResult {
  id: string;
  description: string;
  type: CheckType;
  points: number;
  passed: boolean;
  detail?: string;
}

export interface ScoreResult {
  taskId: string;
  taskTitle: string;
  score: number;
  maxScore: number;
  passing: number;
  status: 'PASS' | 'FAIL';
  passed: CheckResult[];
  failed: CheckResult[];
  warnings: string[];
  changedFiles: string[];
  addedFiles: string[];
  deletedFiles: string[];
  forbiddenViolations: string[];
  createdAt: string;
}
