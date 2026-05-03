// Simple glob-like pattern matcher — no external dependencies.
// Supports: exact names, *.ext, dir/**, dir/*, and combinations.

function buildGlobRegex(pattern: string): RegExp {
  let result = '';
  let i = 0;
  while (i < pattern.length) {
    const c = pattern[i];
    if (c === '*' && pattern[i + 1] === '*') {
      result += '.*';
      i += 2;
      if (pattern[i] === '/') i++;
    } else if (c === '*') {
      result += '[^/]*';
      i++;
    } else if ('.+^${}()|[]\\'.includes(c)) {
      result += '\\' + c;
      i++;
    } else {
      result += c;
      i++;
    }
  }
  return new RegExp('^' + result + '$');
}

// matchesPattern checks whether filePath matches a single glob pattern.
// If the pattern has no slash, it matches against the basename only
// (e.g. "package.json" matches "src/package.json").
// If the pattern has a slash, it matches against the full relative path.
export function matchesPattern(filePath: string, pattern: string): boolean {
  const p = pattern.trim();
  if (!p) return false;

  const f = filePath.replace(/\\/g, '/');
  const regex = buildGlobRegex(p);

  if (p.includes('/')) {
    return regex.test(f);
  } else {
    const basename = f.split('/').pop() ?? f;
    return regex.test(basename);
  }
}

export function matchesAnyPattern(filePath: string, patterns: string[]): boolean {
  return patterns.some(p => matchesPattern(filePath, p));
}

export function parsePatternList(raw: string): string[] {
  return raw
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);
}
