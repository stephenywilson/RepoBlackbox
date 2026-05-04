# Task: Remove unsafe-looking strings from docs

## What's wrong

Two pieces of unsafe-looking text appear in the docs:

1. `README.md` contains a personal-looking local path
2. `docs/example.md` contains a mock placeholder API key

Both should be removed or replaced with neutral placeholders before publishing.

## What to do

- Replace the local path in `README.md` with a generic placeholder like `/path/to/project`
- Remove the `MOCK_KEY_PLACEHOLDER_NOT_REAL_1234567890` string from `docs/example.md`, but keep the surrounding documentation intact
- **Do not delete** `docs/example.md` entirely

## Constraints

- **Do not** modify `package.json`
- **Do not** modify any source files (`src/**`)
- Preserve the useful documentation content

## Done when

- The personal local path is gone from `README.md`
- The mock placeholder key is gone from `docs/example.md`
- `docs/example.md` still exists and still has helpful content
