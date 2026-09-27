# Specification: Prevent Redundant Defaults in `.all-contributorsrc` on Add (Issue #369)

## Context & Motivation

In
[all-contributors/cli#369](https://github.com/all-contributors/cli/issues/369),
users reported that running `all-contributors add <username> <contributions>`
adds redundant `repoType: "github"` and `commitConvention: "angular"` properties
to `.all-contributorsrc` files that did not previously define them.

According to the official documentation:

- `repoType` defaults to `"github"`
- `commitConvention` defaults to `"angular"`

Users with minimal configurations should not have these default properties
forcibly injected into their source-controlled configuration files when simply
adding contributors.

## Root Cause

In `src/util/config-file.js`:

1. `readConfig(configPath)` reads the config file and mutates the in-memory
   object by providing defaults:
   ```javascript
   if (!('repoType' in config)) {
     config.repoType = 'github'
   }
   if (!('commitConvention' in config)) {
     config.commitConvention = 'angular'
   }
   ```
2. `writeContributors(configPath, contributors)` calls `readConfig(configPath)`,
   spreads `{ ...config, contributors }`, and writes it back using
   `writeConfig(configPath, content)`.
3. Because `config` now contains the injected defaults, `writeConfig` serializes
   them back to disk.

## Proposed Changes

### 1. `src/util/config-file.js`

- In `writeContributors(configPath, contributors)`:
  - Read the existing config file directly and parse with `jf` (json-fixer)
    without injecting runtime defaults into the written data.
  - Or read the raw config preserving original keys, update `contributors`, and
    call `writeConfig`.
  - Ensure error handling for missing file (`ENOENT`) or malformed JSON
    (`SyntaxError`) remains consistent.

### 2. Unit Tests (`src/util/__tests__/config-file.js`)

- Add a test verifying that `writeContributors` does not add `repoType` or
  `commitConvention` to a config file that did not define them.
- Verify that `writeContributors` preserves existing `repoType` or
  `commitConvention` if they were already present.

## Verification Checklist

- [x] Unit test: `writeContributors` preserves minimal config without adding
      `repoType` or `commitConvention`
- [x] Unit test: `writeContributors` preserves custom values if present
- [x] All 114+ tests pass (`npm test -- --run`)
- [x] Linter and formatter pass (`npm run lint`)
