# Spec: Ignored Contributors in all-contributors check

## Background & Problem

Issue: https://github.com/all-contributors/cli/issues/330 Users reporting:

> In our project, we have a lot of bots that show up when I choose to "Compare
> contributors from the repository with the credited ones" from the cli
> (`all-contributors check`). I would like the ability to specify this list in
> an `.all-contributorsrc-ignore` (or in `.all-contributorsrc`) such that this
> list need not be perused manually every time to "remove" those entries.

Currently:

- `all-contributors check` compares all contributors retrieved from
  GitHub/GitLab against credited contributors in `.all-contributorsrc`.
- Common bot accounts (`dependabot[bot]`, `renovate[bot]`,
  `github-actions[bot]`, `semantic-release-bot`) are repeatedly flagged under
  `Missing contributors in .all-contributorsrc:`.

## Proposed Solution

1. **Module Extraction**:
   - Extract `checkContributors` from `src/cli.js` into `src/check/index.js`.
2. **Ignored Contributors Sources**:
   - Support `ignoredContributors` array in `.all-contributorsrc` (e.g.
     `["dependabot[bot]", "renovate[bot]"]`).
   - Support `--ignoredContributors` CLI flag in `src/cli.js`.
   - Support `.all-contributorsrc-ignore` and `.all-contributors-ignore` files
     (plain text, one username per line, lines starting with `#` treated as
     comments).
   - Match usernames case-insensitively.
3. **Filtering**:
   - Any repository contributor present in the ignored list is excluded from
     `missingInConfig`.
4. **Unit Tests**:
   - Add `src/check/__tests__/index.js` verifying:
     - Reporting missing contributors when not ignored.
     - Excluding contributors configured in `argv.ignoredContributors`.
     - Excluding contributors listed in `.all-contributorsrc-ignore`.
     - Case-insensitive matching.
     - Handling empty lists and missing ignore files cleanly.
