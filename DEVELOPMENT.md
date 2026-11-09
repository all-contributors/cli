# Development Documentation

## Prerequisites

- **Node.js** 22 or later (see `engines` in `package.json`)
- **npm** (the project uses npm which produces a `package-lock.json`)

## Development commands

These are the npm scripts available when working on the CLI:

| Command                   | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `npm install`             | Install dependencies                                   |
| `npm run build`           | Build the CLI (output in `dist/`)                      |
| `npm run dev`             | Run the CLI from source without building               |
| `npm run start`           | Run the built CLI (`dist/cli.js`)                      |
| `npm run format`          | Fix format issues                                      |
| `npm run lint`            | Check for lint issues                                  |
| `npm run lint -- --fix`   | Fix lint issues                                        |
| `npm test`                | Run the test suite (no coverage)                       |
| `npm run test:coverage`   | Run tests with coverage and generate reports           |
| `npm run commit`          | Commit changes using a commitizen-compatible interface |
| `npm run knip`            | Find unused files, dependencies, and exports           |
| `npm run add-contributor` | Add a contributor (runs kcd-scripts contributors add)  |

## All-contributors CLI commands

When the CLI is installed (`all-contributors-cli`) or run via `npm run dev`,
these are the subcommands:

| Command                                           | Description                                          |
| ------------------------------------------------- | ---------------------------------------------------- |
| `all-contributors add <username> <contributions>` | Add a new contributor                                |
| `all-contributors generate`                       | Generate the contributors list in the README         |
| `all-contributors init`                           | Prepare the project to use this tool                 |
| `all-contributors check`                          | Compare repo contributors with `.all-contributorsrc` |

## Testing and code coverage

### Run tests

The project uses Vitest for testing. To run the test suite use:

```bash
npm test
```

This runs all tests without coverage. For coverage (thresholds and reports), use
`npm run test:coverage` (see below).

If you want to run tests inside your editor and you use VS Code you can install
the VitTest extension so tests are discovered and runnable through the VSCode
test runner.

### Test configuration

Test configuration is in `vitest.config.ts`.

### Coverage thresholds

The project enforces minimum code coverage thresholds in the Vitest config:

| Coverage Type | Percentage |
| ------------- | ---------- |
| Branches      | 50%        |
| Functions     | 40%        |
| Lines         | 50%        |
| Statements    | 50%        |

Tests will fail if coverage drops below these thresholds.

### Coverage reports

Run `npm run test:coverage` to generate coverage reports in the `coverage/`
directory:

- **`coverage/lcov-report/index.html`** — Interactive HTML report (open in a
  browser)
- **`coverage/lcov.info`** — LCOV format (used by Codecov)

The HTML report shows which files are covered by tests.

### Codecov integration

The project uses Codecov to track coverage over time and on pull requests.

#### CI integration

- The workflow `.github/workflows/test-deploy.yml` runs tests with coverage and
  uploads `coverage/lcov.info` to Codecov via a `codecov/codecov-action`
  version.
- Coverage can appear in PR comments if enabled in the Codecov project.

#### Configuration

Codecov is configured in `.codecov.yml`:

- Patch coverage is tracked (coverage of changed code in PRs)
- Project-level status checks are disabled
- PR comments are disabled

Codecov now required a token to upload coverage. Uploads use the repository
secret `secrets.CODECOV_TOKEN` which is scoped to the `all-contributors` org and
CLI repository.

#### Local usage

You don't need a Codecov account to view coverage locally. Run
`npm run test:coverage` and open the HTML report. Codecov is mainly for tracking
trends and CI.

## Static Checks

The project has several forms of static analysis.

### Format

We use Oxfmt for formatting.
Use `format` to reformat.

```sh
npm run format
```

> [!NOTE]
> Be sure to install the `Oxc` extension to get the most out of Oxfmt.

### Lint

We use ESLint as our primary linter.
You can check for violations with:

```sh
npm run lint
```

To auto what ESLint can fix you can run:

```sh
npm run lint -- --fix
```

This will fix many issues (e.g. Vitest aliases, unused eslint-disable
directives, formatting).
Some problems still need manual fixes (e.g. unused variables, tests without assertions).

### Pre-commit hooks

`simple-git-hooks` runs a pre-commit hook that reformats staged files before each commit.

On `git commit`, `simple-git-hooks` runs the pre-commit hook.
The hook runs `lint-staged`, which runs Oxfmt on all staged files.

**Configuration:**

- The hook is configured on `simple-git-hooks` in the `package.json`.
- `lint-staged` is configured in `package.json` under the `lint-staged` field.
- Linting uses `eslint.config.js`.

### How to build

```bash
npm run build
```

Output goes to `dist/`. To run the built CLI locally without publishing, use
`npm run start` (runs `dist/cli.js`) or `npm link` from the repo root and then
run `all-contributors` in another directory.

## Release process

We use conventional commits for merged PRs. The
[Release Please](https://github.com/googleapis/release-please-action) GitHub
Action automates the release flow: after merges to `main`, it opens a release PR
with an updated changelog and version. A maintainer merges that PR when tests
pass and the release is ready.

Release Please needs a GitHub token to open PRs. The repo uses the secret
`ALL_CONTRIBS_RELEASE_PLEASE_TOKEN` (scoped to the all-contributors org and CLI
repo). The same pattern could be extended to the app repo later if needed.

### Release process

TBD -- this is not yet implemented but was implemented via circleci previously.
We plan to create a release based process that will support release please and
manual releases.
