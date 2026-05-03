import path from 'path';

export const BLACKBOX_DIR = '.repoblackbox';
export const SNAPSHOTS_DIR = path.join(BLACKBOX_DIR, 'snapshots');
export const REPORTS_DIR = path.join(BLACKBOX_DIR, 'reports');
export const RUNS_DIR = path.join(BLACKBOX_DIR, 'runs');
export const CONFIG_FILE = path.join(BLACKBOX_DIR, 'config.json');
export const PROTECTED_JSON = path.join(BLACKBOX_DIR, 'protected-files.json');
export const LATEST_SNAPSHOT = path.join(SNAPSHOTS_DIR, 'latest.json');
export const LATEST_AUDIT_MD = path.join(REPORTS_DIR, 'latest-audit.md');
export const LATEST_AUDIT_JSON = path.join(REPORTS_DIR, 'latest-audit.json');
export const LATEST_REPORT_MD = path.join(REPORTS_DIR, 'latest-report.md');
export const LATEST_SCOPE_JSON = path.join(RUNS_DIR, 'latest-scope.json');

export const ROOT_DOCS = [
  'AGENT_RULES.md',
  'PROJECT_CONTEXT.md',
  'PROTECTED_FILES.md',
  'TASK_SCOPE.md',
] as const;

export const DEFAULT_PROTECTED_PATTERNS = [
  '.env',
  '.env.*',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lockb',
  'package.json',
  'vercel.json',
  'netlify.toml',
  'Dockerfile',
  'docker-compose.yml',
  'src/lib/auth/**',
  'src/lib/billing/**',
  'src/lib/stripe/**',
  'src/config/**',
  'src/api/**',
  'app/api/**',
  'pages/api/**',
  'database/**',
  'prisma/**',
  'migrations/**',
];

export const SNAPSHOT_IGNORE_PREFIXES = [
  '.git/',
  'node_modules/',
  'dist/',
  'build/',
  '.next/',
  'out/',
  'coverage/',
  '.turbo/',
  '.cache/',
  '.repoblackbox/snapshots/',
  '.repoblackbox/reports/',
];

export const SNAPSHOT_IGNORE_EXACT = new Set(['.DS_Store']);

export const SENSITIVE_PREFIXES = ['.env'];

export function isSensitiveFile(rel: string): boolean {
  const name = path.basename(rel);
  return name === '.env' || name.startsWith('.env.');
}

export function shouldIgnoreForSnapshot(rel: string): boolean {
  if (SNAPSHOT_IGNORE_EXACT.has(rel)) return true;
  return SNAPSHOT_IGNORE_PREFIXES.some(p => rel.startsWith(p));
}
