# Spec: Fix Config File Error Handling and Vague Errors

## Context & Motivation

Issue:
[all-contributors/cli#346](https://github.com/all-contributors/cli/issues/346)  
Title: **"There's still an error" message when trying to run cli via GH
actions**

When running `all-contributors generate` or `all-contributors add` in CI/GitHub
Actions, users encountered a cryptic `"There's still an error!"` message without
diagnostic context, followed by unexpected failure or missing contributors.

### Root Cause Analysis

1. **Error Loss in `src/util/config-file.js`**:
   - When a config file does not exist, `fs.readFile` throws an error with
     `code: 'ENOENT'`. In `readConfig`, this was caught and rethrown as
     `new Error('Configuration file not found: ...')`, which discarded the
     `code: 'ENOENT'` property.
   - When a config file contains unfixable malformed JSON, `json-fixer` (`jf`)
     logs `There's still an error!` to `stderr` and throws a plain
     `Error(err.message)` (which is **not** an instance of `SyntaxError`).
   - `readConfig` only checked `if (error instanceof SyntaxError)`. Because `jf`
     throws `Error`, `readConfig` rethrew the plain `Error` directly instead of
     a `SyntaxError`.

2. **Silent Failure in `src/cli.js`**:
   - `src/cli.js` catches errors when loading config:
     ```javascript
     try {
       const configData = await util.configFile.readConfig(argv.config)
       Object.assign(argv, configData)
     } catch (error) {
       if (error instanceof SyntaxError || argv.config !== defaultRCFile) {
         throw error
       }
       // If default config file doesn't exist, that's okay
     }
     ```
   - When `.all-contributorsrc` existed but was malformed:
     - `error instanceof SyntaxError` was `false` (it was a plain `Error` from
       `json-fixer`).
     - `argv.config !== defaultRCFile` was `false` (default config file).
   - As a result, the `catch` block completely swallowed the malformed config
     error, falsely assuming the config file simply did not exist!
   - `cli.js` then proceeded to execute commands (such as `generate` or `check`)
     with an empty, uninitialized configuration, leading to corrupted output or
     secondary errors.

## Solution

### 1. Robust `readConfig` in `src/util/config-file.js`

- Wrap `fs.readFile`: when `error.code === 'ENOENT'`, rethrow with
  `error.code = 'ENOENT'` attached so callers can accurately distinguish missing
  files from syntax or I/O errors.
- Wrap `jf` in a `try...catch`: when `jf` throws an error, construct and throw a
  `SyntaxError`:
  `Configuration file has malformed JSON: ${configPath}. Error: ${error.message}`.
  This ensures any JSON parse failure is consistently typed as `SyntaxError`.

### 2. Precise Missing File Handling in `src/cli.js`

- Only ignore errors when `error.code === 'ENOENT'` and
  `argv.config === defaultRCFile`.
- If the error is not `ENOENT` (e.g., `SyntaxError`, permission errors), rethrow
  immediately, preventing silent corruption of contributor tables.

## Verification Plan

1. Unit tests in `src/util/__tests__/config-file.js`:
   - Reading an absent configuration file throws an error with
     `code === 'ENOENT'`.
   - Reading a malformed configuration file throws `SyntaxError` with a clear
     message including the file path and parse error.
2. Full test suite verification with `npm test -- --run`.
3. Linter and formatting check with `npm run lint`.
