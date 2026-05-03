export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type FileRisk = 'HIGH' | 'MEDIUM' | 'NORMAL';

const HIGH_PATTERNS: RegExp[] = [
  /^\.env(\..+)?$/,
  /^\.env$/,
  /src\/lib\/auth\//,
  /src\/lib\/billing\//,
  /src\/lib\/stripe\//,
  /src\/config\//,
  /src\/api\//,
  /app\/api\//,
  /pages\/api\//,
  /database\//,
  /prisma\//,
  /migrations?\//,
  /^Dockerfile(\..+)?$/,
  /^docker-compose(\.override)?\.ya?ml$/,
  /^vercel\.json$/,
  /^netlify\.toml$/,
  /^\.github\/workflows\//,
  /^\.travis\.yml$/,
  /^\.circleci\//,
];

const MEDIUM_PATTERNS: RegExp[] = [
  /^package\.json$/,
  /^package-lock\.json$/,
  /^pnpm-lock\.yaml$/,
  /^yarn\.lock$/,
  /^bun\.lockb$/,
  /^tsconfig(.*)?\.json$/,
  /^\.eslintrc(\..*)?$/,
  /^\.prettierrc(\..*)?$/,
  /^vite\.config\./,
  /^next\.config\./,
  /^tailwind\.config\./,
  /^jest\.config\./,
  /^babel\.config\./,
  /^webpack\.config\./,
  /^rollup\.config\./,
  /^svelte\.config\./,
  /^astro\.config\./,
  /^remix\.config\./,
];

export interface RiskFlags {
  highFiles: string[];
  mediumFiles: string[];
  deletedCount: number;
  largeChange: boolean;
  scopeViolationCount: number;
  outOfScopeCount: number;
}

export function classifyFileRisk(rel: string): FileRisk {
  if (HIGH_PATTERNS.some(p => p.test(rel))) return 'HIGH';
  if (MEDIUM_PATTERNS.some(p => p.test(rel))) return 'MEDIUM';
  return 'NORMAL';
}

export function computeRiskLevel(flags: RiskFlags): RiskLevel {
  if (
    flags.highFiles.length > 0 ||
    flags.deletedCount > 10 ||
    flags.largeChange ||
    flags.scopeViolationCount > 0
  ) return 'HIGH';
  if (flags.mediumFiles.length > 0 || flags.deletedCount > 3 || flags.outOfScopeCount > 0) return 'MEDIUM';
  return 'LOW';
}
