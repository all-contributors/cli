# Development Documentation

## Testing and Code Coverage

### Running Tests

The project uses Jest for testing. To run the test suite you can use:

```bash
npm test
```

This runs all tests with code coverage analysis enabled.

### Test Configuration

Test configuration is in `jest.config.js`, which extends `kcd-scripts/jest` with
project-specific settings:

```javascript
const jestConfig = require('kcd-scripts/jest')

module.exports = Object.assign(jestConfig, {
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 40,
      lines: 50,
      statements: 50,
    },
  },
  forceExit: true,
})
```

### Coverage Thresholds

The project enforces minimum code coverage thresholds through the jest
configuration above:

- **Branches:** 50%
- **Functions:** 40%
- **Lines:** 50%
- **Statements:** 50%

Tests will fail if coverage drops below these thresholds.

### Coverage Reports

When you run tests, coverage reports are automatically generated in the
`coverage/` directory:

- **`coverage/lcov-report/index.html`** — Interactive HTML report (open in
  browser)
- **`coverage/lcov.info`** — LCOV format (used by Codecov)
- **`coverage/clover.xml`** — Clover XML format
- **`coverage/coverage-final.json`** — JSON format

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

- Jest method aliases (e.g., `toThrowError()` → `toThrow()`)
- Unused eslint-disable directives
- Some formatting issues

**Note:** Some errors require manual fixes (e.g., unused variables, tests
without assertions).

### Pre-commit hooks

The project uses Husky to run pre-commit hooks that automatically lint and fix
staged files before each commit.

**How it works:**

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
- **eslint-plugin-jest** — Jest-specific rules for test files
- **globals** — Provides properly formatted global variables for Node.js and
  Jest environments

### Configuration file

The ESLint configuration is in `eslint.config.mjs` at the project root. It uses
ESLint 9's flat config format and includes:

- Base rules from `eslint:recommended`
- Import plugin rules
- Jest plugin rules (for test files only)
- Custom overrides for project-specific needs
- Support for both CommonJS and ES module syntax
