# Spec: Support Additional Config File Options (.all-contributors.json, .config/all-contributors.json)

## Background & Problem

Issue: https://github.com/all-contributors/cli/issues/499 Reported by Nate
Scherer (@natescherer):

> I believe there are several issues with the current standard of the config
> file being `.all-contributorsrc` in the root of the repo:
>
> 1. Lack of extension makes the format ambiguous to some editors
> 2. Config files in the root clutter things up and make the repo less readable,
>    in my opinion
>
> I would propose supporting the following configs, with the CLI using the first
> one detected:
>
> - `.all-contributorsrc`
> - `.all-contributors.json`
> - `.all-contributorsrc.json`
> - `.config/all-contributors.json`
> - `.config/.all-contributorsrc`
> - `.config/.all-contributorsrc.json`

Currently:

- `all-contributors-cli` hardcodes `path.join(cwd, '.all-contributorsrc')` as
  the default config file in `src/cli.js`.
- If a project uses `.all-contributors.json` or `.config/all-contributors.json`,
  the CLI does not automatically detect it unless explicitly passed via
  `--config`.

## Proposed Solution

1. **Config File Discovery in `src/util/config-file.js`**:
   - Define
     `CONFIG_FILES = ['.all-contributorsrc', '.all-contributorsrc.json', '.all-contributors.json', '.config/.all-contributorsrc', '.config/.all-contributorsrc.json', '.config/all-contributors.json']`.
   - Export `findConfigFile(cwd = process.cwd())`: iterates through candidate
     locations in priority order, returning the path of the first existing file,
     or `null` if none found.
2. **CLI Auto-Discovery in `src/cli.js`**:
   - Keep `--config` / `-c` as an explicit override.
   - If `--config` is omitted, call `findConfigFile(cwd)` to detect any existing
     config file in the project.
   - If a config file is found (e.g., `.all-contributors.json` or
     `.config/all-contributors.json`), use it as `argv.config`.
   - If no config file is found, fall back to `.all-contributorsrc`.
3. **Unit Tests**:
   - Add unit tests in `src/util/__tests__/config-file.js` testing
     `findConfigFile`:
     - Detects `.all-contributorsrc` in root.
     - Detects `.all-contributors.json` in root when `.all-contributorsrc` is
       absent.
     - Detects `.config/all-contributors.json` in `.config/` subdirectory.
     - Returns `null` when no configuration file exists.
     - Correctly honors candidate resolution priority.
