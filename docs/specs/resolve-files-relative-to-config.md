# Specification: Resolve Files Relative to Config Directory & Support CLI `--files` Array (Issue allcontributors.org#707)

## Context & Motivation

In
[all-contributors/allcontributors.org#707](https://github.com/all-contributors/allcontributors.org/issues/707),
users reported two interrelated bugs when passing `--config` and `--files`
flags:

1. **Working Directory / Path Resolution Bug**: When invoking
   `all-contributors generate --config /path/to/project/.all-contributorsrc`,
   the CLI attempted to open `README.md` at `$PWD/README.md`
   (`path.join(cwd, file)`) rather than relative to the directory containing the
   config file (`/path/to/project/README.md`). This threw:
   `Error: ENOENT: no such file or directory, open '/current/dir/README.md'`.

2. **`--files` Argument Parsing Bug**: When users attempted to work around the
   path resolution issue by passing `--files /path/to/project/README.md`, yargs
   parsed `--files` as a string rather than an array because `.array('files')` /
   `type: 'array'` was not configured. This resulted in:
   `TypeError: argv.files.map is not a function at startGeneration`.

## Scope of Changes

### 1. `src/cli.js`

- **CLI Options (`getArgs`)**:
  - Configure `files` as an array option in yargs
    (`.option('files', { type: 'array', description: 'Files to update' })` or
    `.array('files')`).
- **File Resolution (`startGeneration`)**:
  - Derive `baseDir` from `argv.config`:
    ```javascript
    const baseDir = argv.config ? path.dirname(path.resolve(argv.config)) : cwd
    ```
  - Ensure `files` is normalized as an array:
    ```javascript
    const files = Array.isArray(argv.files)
      ? argv.files
      : typeof argv.files === 'string'
        ? [argv.files]
        : ['README.md']
    ```
  - Resolve each file using:
    ```javascript
    const filePath = path.isAbsolute(file) ? file : path.resolve(baseDir, file)
    ```

### 2. `src/util/git.js`

- Normalize `options.files` in `commit()` so that if `files` is a string or
  array, it is correctly concatenated with `options.config`.
- Resolve file paths using
  `path.isAbsolute(file) ? file : path.resolve(baseDir, file)`.

### 3. Unit Tests

- Add unit tests verifying:
  - `startGeneration` resolves files relative to `path.dirname(argv.config)`.
  - Passing a single string or array to `argv.files` correctly generates content
    without `TypeError`.

## Verification

- Run `npm test -- --run` (all tests passing).
- Run linter/formatting checks.
