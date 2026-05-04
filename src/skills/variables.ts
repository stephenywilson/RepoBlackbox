export function parseVarsFromCli(varStrings: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const v of varStrings) {
    const eq = v.indexOf('=');
    if (eq === -1) {
      throw new Error(`Invalid --var "${v}". Expected key=value form.`);
    }
    const key = v.slice(0, eq).trim();
    const value = v.slice(eq + 1);
    if (!key) {
      throw new Error(`Invalid --var "${v}". Empty key.`);
    }
    result[key] = value;
  }
  return result;
}

export function findMissingRequired(
  required: string[],
  provided: Record<string, string>,
): string[] {
  return required.filter(name => !(name in provided));
}
