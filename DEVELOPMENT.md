# Development Guide

This guide will help you get started with working on the all-contributors CLI.
We're excited to have you here! This document covers everything you need to know
about our testing setup, development workflow, and how to contribute
effectively.

## Prerequisites

Before you begin working on the package, make sure you have the following
installed:

- **Node.js**: >=22.22.0
- **Package Manager**: pnpm (version 8)

If you don't have pnpm installed yet, you can install it globally with
`npm install -g pnpm`.

## Getting started

Once you've cloned the repository, getting set up is straightforward:

1. Install pnpm:

   ```bash
   pnpm install
   ```

That's it! You're ready to start developing.

## Testing

All pull requests should be tested and validated before merging. Our test suite
is configured to run automatically on all pull requests using GitHub Actions.

IMPORTANT: we are in the process of migrating from CircleCI to GitHub Actions.

So you will see both in our configuration.

### Testing tools

We use a combination of tools to ensure code quality:

- **Jest**: Our test framework, configured via `kcd-scripts` to provide sensible
  defaults
- **nock**: For mocking HTTP requests when testing API interactions
- **kcd-scripts**: A helpful wrapper that provides Jest configuration and
  testing utilities, so you can focus on writing tests rather than configuring
  them

### How to run tests

You can run tests using pnpm or npm.

#### Run all tests

```bash
pnpm test
```

This command runs Jest with our project configuration from `jest.config.js`. It
runs all tests once and exits (no watch mode). This matches the behavior in CI.
It includes:

- Test coverage collection
- Coverage thresholds (50% branches/lines/statements, 40% functions)

**Tip**: If you want to run tests in watch mode during development (tests will
re-run automatically when files change), you can use:

```bash
pnpm test -- --watch
```

#### Run validation (recommended before committing)

```bash
pnpm validate
```

This is our all-in-one command that runs everything you need to clean up your
code and docs before committing:

- Linting (ESLint)
- Type checking
- Tests
- Build verification

**Tip**: This is the same command that runs in CI, so if `pnpm validate` passes
locally, your PR should pass CI checks.

### Test structure

Tests are an important part of our development workflow.

- Test files live in `__tests__` directories right next to the source files
- For example, `src/util/__tests__/url.js` tests `src/util/url.js`
- We use Jest's standard `test()` and `expect()` APIs, so if you're familiar
  with Jest, you'll feel right at home

### Writing tests

When you're adding new features, here's what we'd love to see:

1. Write tests alongside your code (we find this helps us think through edge
   cases)
2. Place test files in `__tests__` directories next to the code they test
3. Use `nock` for mocking HTTP requests to external APIs (it makes testing API
   interactions much easier)
4. Make sure coverage thresholds are met (you can check `jest.config.js` for the
   current requirements)

## Code quality

We maintain high code quality standards, and we've set up tools to help make
this easy for everyone.

### Linting

Run the linter anytime with:

```bash
pnpm lint
```

We use ESLint with configuration from `kcd-scripts`, and we've customized some
rules in `package.json` to fit our project's needs. The linter helps catch
common mistakes and keeps our codebase consistent.

### Pre-commit hooks

We've set up Husky to run `kcd-scripts pre-commit` automatically before each
commit. This means:

- Staged files are linted
- Code is formatted with Prettier
- Tests run on staged files

This helps catch issues before they make it into the repository, saving everyone
time. If the pre-commit hook fails, don't worry—just fix the issues and try
committing again.

## Building

To build the project:

```bash
pnpm build
```

This compiles the source code from `src/` to `dist/` using Babel (via
`kcd-scripts build`). The built files are what get published to npm, so it's
worth making sure the build works before pushing your changes.

## Continuous integration

We run tests automatically to ensure everything stays working:

- Push to `main` branch
- Pull requests
- Manual workflow dispatch (for when you want to test things manually)

Our CI workflow (`.github/workflows/test-deploy.yml`) does the following:

1. Runs `pnpm validate` - This runs all our checks (lint, test, build)
2. Uploads test coverage as an artifact
3. (Deploy job is currently disabled while we finalize our release process)

If you see a CI failure, don't panic! Check the logs—they'll tell you exactly
what went wrong, and you can usually reproduce the issue locally by running
`pnpm validate`.

## Coverage

We track test coverage to help ensure our codebase is well-tested. When you run
tests, coverage reports are automatically generated.

## Development scripts

Here are all the scripts available to you:

- `pnpm test` - Run tests only
- `pnpm validate` - Run lint, test, and build (this is what you want to run
  before committing)
- `pnpm lint` - Run the linter only
- `pnpm build` - Build the project
- `pnpm dev` - Run the CLI from source (`./src/cli.js`) - great for quick
  testing
- `pnpm start` - Run the CLI from built files (`./dist/cli.js`)
- `pnpm commit` - Use commitizen for conventional commits (helps keep our commit
  history clean)

## Troubleshooting

We've all been there—sometimes things don't work as expected. Here are some
common issues and how to fix them:

### Tests are failing

If your tests aren't passing, try these steps:

- Make sure you've run `pnpm install` to install all dependencies
- Check that you're using Node.js >=22.22.0 (you can check with
  `node --version`)
- Try clearing `node_modules` and reinstalling:
  `rm -rf node_modules && pnpm install`

If you're still stuck, feel free to open an issue or ask for help—we're here to
support you!

### Coverage thresholds not met

If you're seeing coverage threshold errors:

- Review the coverage report in the `coverage/` directory to see what's not
  covered
- Add tests for uncovered code paths
- Check `jest.config.js` for the current threshold requirements

Remember, these thresholds are there to help us maintain quality, but they're
not meant to be a burden. If you're having trouble meeting them, reach out and
we can discuss the best approach.
