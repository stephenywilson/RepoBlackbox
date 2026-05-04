# Task: Sync CLI version output with package.json

## What's wrong

`package.json` declares version `0.2.0`, but `src/cli.ts` still prints `0.1.1` when called with `--version`. This is misleading.

## What to do

Update `src/cli.ts` so `--version` prints `0.2.0`. Reading the version from `package.json` is preferred over hardcoding, but either approach is acceptable.

## Constraints

- **Do not** modify `README.md`
- Keep the change minimal (1-2 files)

## Done when

- `node src/cli.ts --version` would print `0.2.0`
- The string `0.1.1` is no longer present in `src/cli.ts`
- `README.md` was not modified
