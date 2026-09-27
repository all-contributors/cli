# Specification: Preserve Existing Contributions on Add (Issue #371)

## Context & Motivation

In
[all-contributors/cli#371](https://github.com/all-contributors/cli/issues/371),
users reported that running:

```bash
npx all-contributors-cli add <username> <contributions>
```

overwrites and removes all other contributions if the contributor already has
multiple contribution types and an existing type is supplied.

For example:

- Contributor `@jdoe` has `["code", "doc"]`.
- Running `all-contributors add jdoe doc` (or `all-contributors add jdoe code`)
  shrank `@jdoe`'s contributions to only `["doc"]` (or `["code"]`).
- In automated environments (such as CI workflows crediting contributors or
  GitHub bot commands), this resulted in unintended data loss.

## Root Cause

In `src/contributors/add.js`:

```javascript
function formatContributions(options, existing = [], types) {
  const same = types.filter(type =>
    existing.some(
      existingType => uniqueTypes(existingType) === uniqueTypes(type),
    ),
  )
  const remove = types.length < existing.length && same.length

  if (remove) {
    return same
  }
  ...
}
```

An earlier heuristic introduced in PR #94 assumed that if the passed
`types.length` was smaller than `existing.length` and contained any overlapping
types (`same.length > 0`), it indicated an intentional removal of the omitted
types. However:

1. `add` is an addition command: passing a contribution type should always
   ensure that type is added to the user's existing contributions.
2. Silently deleting other contributions when an existing contribution type is
   re-added violates the contract of `add`.

## Proposed Architecture

1. **Additive Default for `add` (`src/contributors/add.js`)**:
   - By default, `formatContributions` merges `existing` and `types` (union)
     without removing any existing contribution types.
   - Preserves custom URL objects if already present in `existing`.
2. **Explicit Replacement Support (`options.replace`)**:
   - Introduce `options.replace` (boolean) to explicitly indicate when
     contributions should be replaced rather than merged.
   - When `options.replace: true`, `formatContributions` sets the contributions
     to `types` (preserving matching URLs from `existing`).
3. **Interactive Mode Alignment (`src/contributors/prompt.js`)**:
   - In interactive mode (`contributions === undefined`), the user is presented
     with checkboxes pre-selected with all previous contribution types. Because
     the user explicitly selects the full desired set of contributions
     (including unchecking types they wish to remove), interactive mode sets
     `replace: true`.
   - In non-interactive CLI mode (`contributions` provided on command line),
     `replace` defaults to `false`.
4. **CLI Flag (`src/cli.js`)**:
   - Add `--replace` option to `add` command
     (`all-contributors add <username> <contributions> --replace`) for cases
     where a user or script intentionally wants to overwrite all contributions.
5. **Unit Tests (`src/contributors/__tests__/add.js`)**:
   - Verify that adding an existing contribution type preserves all other
     existing contributions (fixing #371).
   - Verify that adding a new contribution type preserves existing
     contributions.
   - Verify that `replace: true` allows replacing/removing contribution types.
