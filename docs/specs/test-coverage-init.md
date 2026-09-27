# Spec: Test Coverage for all-contributors init

## Background & Problem

Issue: https://github.com/all-contributors/cli/issues/409 Lead maintainer Leah
Wasser (@lwasser) noted:

> When upgrading dependencies the tests were passing but it seems like we need a
> integration set of tests that ensure the cli still runs. Let's start by
> creating a test for the all-contributors init. i think we will need to mock
> the returns for some of the prompts in creating the test. For me, the command
> failed immediately, and it's failing on the newer versions of yargs. So we
> should have some integration tests that will help us identify CLI issues.

Currently:

- `src/init/index.js` (`init()`) has no unit or integration tests.
- `src/init/prompt.js` (`prompt()`) has no tests for questions, dynamic
  defaults, or answer mapping.
- Only `src/init/init-content.js` has tests in
  `src/init/__tests__/init-content.js`.

## Proposed Solution

1. **`src/init/__tests__/prompt.js`**:
   - Test default values when `git.getRepoInfo()` resolves with repository
     details (e.g. `projectName` and `projectOwner`).
   - Test fallback behavior when `git.getRepoInfo()` resolves with `null`.
   - Test questions' dynamic properties:
     - `repoHost` default function returning `https://github.com` for GitHub and
       `https://gitlab.com` for GitLab.
     - `badgeFile` `when` conditional (only asked if `needBadge` is true).
     - `badgeFile` default function defaulting to `answers.contributorFile`.
     - `imageSize` filter correctly parsing integer strings.
   - Test result transformation: produces valid `config` object with
     `uniqueFiles`, default `contributors: []`, `contributorsPerLine: 7`, and
     correct `contributorFile` and `badgeFile`.

2. **`src/init/__tests__/index.js`**:
   - Test `init()` execution flow:
     - Prompts user via mocked `prompt()`.
     - Calls `configFile.writeConfig('.all-contributorsrc', config)`.
     - Ensures target contributor file exists (creates empty file if missing).
     - Injects contributor list markup via `addContributorsList`.
     - If `badgeFile` is provided, injects badge markup via `addBadge`.
     - If `badgeFile` is omitted or falsey, does not inject badge.
     - Handles and propagates file system or configuration write errors.

## Verification

- Run `npm test -- --run` and verify that all test suites pass.
- Run `npm run lint` and verify Prettier and ESLint pass without warnings.
