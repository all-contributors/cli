# Development Documentation

## Testing and Code Coverage

### Running Tests

The project uses Vitest for testing. To run the test suite you can use:

```bash
npm test
```

This runs all tests with code coverage analysis enabled.

Note: if you want to run your tests locally in VS Code using the interactive IDE,
be sure to install the Jest (orta) extension so your tests are discovered.

### Test Configuration

Test configuration is in `vitest.config.ts`.

### Coverage Thresholds

The project enforces minimum code coverage thresholds through the Vitest
configuration file:

| Coverage Type | Percentage |
| ------------- | ---------- |
| Branches      | 50%        |
| Functions     | 40%        |
| Lines         | 50%        |
| Statements    | 50%        |

Tests will fail if coverage drops below these thresholds.

### Coverage Reports

Run `test-coverage` to generate coverage reports in the `coverage/` directory:

- **`coverage/lcov-report/index.html`** — Interactive HTML report (open in
  browser)
- **`coverage/lcov.info`** — LCOV format (used by Codecov)

The HTML report provides a visual breakdown of which files are covered by tests.

### Codecov Integration

The project uses Codecov to track code coverage over time and on pull requests.

#### CI Integration

- The GitHub Actions workflow (`.github/workflows/test-deploy.yml`)
  automatically uploads coverage to Codecov after running tests
- Coverage reports appear as comments on pull requests (if enabled)
- The workflow uses `codecov/codecov-action@vxxx` (whatever version is most
  recent) to upload the `lcov.info` file

#### Configuration

Codecov behavior is configured in `.codecov.yml`:

- Patch coverage is tracked (checks coverage of changed code in PRs)
- Project-level status checks are disabled
- PR comments are disabled
- Codecov now requires a token for all uploads so we have one generated in the
  repo as a secret `secrets.CODECOV_TOKEN`.

#### Local Usage

You don't need a Codecov account to view coverage locally—just run `pnpm test`
and open the HTML report. Codecov integration is primarily for tracking coverage
trends and to simplify PR reviews in the CI/CD pipeline.

## Linting

2026 update: The project is now using ESLint 9 and the flat config format. As we
update things from the old config we will update this document to reflect the
changes. Once the code base is stable and things work, we can delete some of the
historical documentation. But for now this document can help us track design
decisions and changes made.

### Overview

The project uses a native ESLint configuration that was migrated from
kcd-scripts. The setup supports both CommonJS source files and ES module test
files, using ESLint 9's flat config format.

### What changed

Previously, the project used `kcd-scripts` for linting configuration. Because
that project is no longer actively maintained, we migrated to a native ESLint
setup that replicates the same behavior.

**Migration details:**

- Replaced `kcd-scripts lint` with native ESLint
- Created `eslint.config.mjs` using ESLint 9 flat config format
- Extracted rules from `eslint-config-kentcdodds` to create a simplified,
  maintainable config. This included removing a lot of the custom rules and
  leaning more on the recommended rules.
- Preserved some custom rule overrides from the original setup
- Supports both CommonJS (source files) and ES modules (test files)

Note: We should consider refacting the project to use ES modules instead of
CommonJS (if everyone supports that) in the future for consistency.

### How to run the linter

To check for linting errors you can run:

```bash
npm run lint
```

ESlint can automatically fix some errors. to fix errors automatically run:

```bash
npm run lint -- --fix
```

The `--fix` flag will automatically fix many common issues like:

- Vitest method aliases (e.g., `toThrowError()` → `toThrow()`)
- Unused eslint-disable directives
- Some formatting issues

**Note:** Some errors require manual fixes (e.g., unused variables, tests
without assertions).

### Pre-commit hooks

The project uses Husky to run pre-commit hooks that automatically lint and fix
staged files before each commit.

#### How it works:

1. When you run `git commit`, Husky intercepts the commit
2. The pre-commit hook runs `lint-staged`
3. `lint-staged` runs `eslint --fix` on all staged JavaScript/TypeScript files
4. If linting passes, the commit proceeds; if it fails, the commit is blocked

What this means... this workflow ensures that code is automatically linted and
fixed before it's committed to version control.

If you are encountering issues with the pre-commit hook, you can run the
following command to manually lint and fix the files:

```bash
npm run lint -- --fix
```

Or if it's really problematic, you can skip verification and commit anyway with
the `--no-verify` flag.

```bash
git commit --no-verify
```

If you do this please ping one of the maintainers in the PR that you open so
they can help you fix the issues!

**Configuration:**

- Husky configuration is in `package.json` under the `husky.hooks.pre-commit`
  field
- `lint-staged` configuration is in `package.json` under the `lint-staged` field
- The setup uses the native ESLint configuration (`eslint.config.mjs`)

**Note:** Previously, the project used `kcd-scripts pre-commit` which handled
both hook management and linting. We migrated to using `lint-staged` directly
with our native ESLint config to avoid version conflicts.

### Dependencies

The following packages are typical starters for linting a JavaScript project:

- **eslint** — ESLint core
- **@eslint/js** — ESLint recommended rules configuration
- **eslint-plugin-import** — Import/export rules for module resolution and best
  practices
- **@vitest/eslint-plugin** — Vitest-specific rules for test files
- **globals** — Provides properly formatted global variables for Node.js and
  Vitest environments

### Configuration file

The ESLint configuration is in `eslint.config.mjs` at the project root. It uses
ESLint 9's flat config format and includes:

- Base rules from `eslint:recommended`
- Import plugin rules
- Vitest plugin rules (for test files only)
- Custom overrides for project-specific needs
- Support for both CommonJS and ES module syntax

## Build system and process migration

Our build system has been migrated from `kcd-scripts build` to native Babel.
Below are the dependencies we add for the new native build and a description of
what each does.

For now we are keeping _some_ of the dependencies from the kcd-scripts build
system. We might be able to remove others as we refine the build process and
better get to know the project.

### Build dependencies (from kcd-scripts → native Babel)

- **@babel/core**
  - **Status:** Required
  - **Purpose:** The Babel compiler. Performs the actual transpilation (parse →
    transform → generate).

- **@babel/cli**
  - **Status:** Required
  - **Purpose:** Command-line interface. Runs `babel src --out-dir dist` and
    feeds files to @babel/core.

- **@babel/preset-env**
  - **Status:** Required
  - **Purpose:** Preset that compiles modern JS to match a target environment
    (e.g. Node 22). Handles syntax and, optionally, module format.

- **@babel/plugin-transform-runtime**
  - **Status:** REMOVED
  - **Purpose:** Replaces inlined Babel helpers with
    `require('@babel/runtime/...')` so helpers live in one place. Keeps dist
    smaller and avoids duplicating helper code in every file.

- **@babel/plugin-transform-modules-commonjs**
  - **Status:** REMOVED
  - **Purpose:** Converts ES module syntax to CommonJS. Only needed if
    preset-env is set with `modules: false`; if preset-env uses
    `modules: 'commonjs'`, this plugin is redundant.

- **@babel/plugin-transform-class-properties**
  - **Status:** REMOVED
  - **Purpose:** Transpiles class properties (including static) in loose mode.

- **babel-plugin-macros**
  - **Status:** Removed
  - **Purpose:** Enables macro-based transforms (e.g. preval, codegen).
    kcd-scripts includes it by default. We don't use macros in this project.

- **semver**
  - **Status:** Removed
  - **Purpose:** Used in a config helper to read `engines.node` from
    package.json and derive the target Node version. We hardcode our target
    (e.g. `node: '22.22.0'`) in babel.config.js instead.

- **@babel/runtime**
  - **Status:** Required
  - **Purpose:** Already a production dependency. Provides the helper functions
    that `@babel/plugin-transform-runtime` injects imports for. Required at
    runtime when using that plugin.

IMPORTANT: there are still 2 bugs in the cli that i don't want to fix in this PR
but the cli is broken. We can fix these bugs in a future pr and also add tests
that will catch these bugs in the future.
