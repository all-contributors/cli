# Spec: Test Coverage for addContributor and addContributorWithDetails

## Background & Objective

Issue: https://github.com/all-contributors/cli/issues/439 Lead maintainer Leah
Wasser (@lwasser) noted:

> In my current pr #438, I started by trying to improve test coverage for the
> prompt.js file, as the prompts were broken. But this mean i had to make some
> updates elsewhere as I discovered some bugs. We also need tests for
> addContribution. To avoid making that pr huge, let's add the next set of tests
> (which will require mocks) in a new pr.

Currently:

1. `src/contributors/index.js` (`addContributor`) has 0% test coverage with no
   test suite.
2. `src/contributors/addWithDetails.js` (`addContributorWithDetails`) has only a
   single basic test, missing tests for updating existing contributors,
   case-insensitivity, contribution merging, and custom URLs.

## Plan & Scope

1. **`src/contributors/__tests__/index.js`**:
   - Test adding a new contributor:
     - Prompts for answers (or receives username + contributions).
     - Fetches user info via `repo.getUserInfo`.
     - Appends contributor to options.
     - Calls `util.configFile.writeContributors`.
     - Returns
       `{ username, contributions, contributors, newContributor: true }`.
   - Test updating an existing contributor:
     - Does NOT invoke `repo.getUserInfo`.
     - Merges contributions into existing contributor record.
     - Calls `util.configFile.writeContributors`.
     - Returns
       `{ username, contributions, contributors, newContributor: false }`.
   - Test case insensitivity when updating:
     - e.g. existing contributor `JohnDoe`, input `johndoe` -> correctly updates
       and identifies as existing (`newContributor: false`).
   - Test error handling:
     - When prompt rejects or throws, promise rejects.
     - When `repo.getUserInfo` fails/rejects, promise rejects.
     - When `util.configFile.writeContributors` fails/rejects, promise rejects.

2. **`src/contributors/__tests__/addWithDetails.js`**:
   - Test adding a new contributor without network calls (existing test).
   - Test updating an existing contributor with new contribution types.
   - Test updating an existing contributor case-insensitively.
   - Test adding a contributor with a custom URL in `options.url`.
   - Test removing/filtering contributions when a subset is supplied.
   - Test when initial contributors array is empty or undefined.

## Verification

- Run `npm test -- --run` to ensure all 16 test suites and all tests pass
  cleanly.
- Run `npm run lint` to ensure no lint regressions.
