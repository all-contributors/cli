# Spec: Support Crediting Non-Git and Custom Contributors

## Context & Motivation

Issues:

- [all-contributors/cli#325](https://github.com/all-contributors/cli/issues/325)
  (Crediting people/institutions not in github)
- [all-contributors/allcontributors.org#816](https://github.com/all-contributors/allcontributors.org/issues/816)
  (Is it possible to add contributors who don't have a GitHub account?)

Users often need to recognize individuals, organizations, institutions,
translators, funders, or community members who do not possess a GitHub or GitLab
account.

Currently, the `all-contributors add <username> <contributions>` command
unconditionally queries the host platform's API (e.g.
`https://api.github.com/users/<username>`). When the specified user is not
registered on GitHub or GitLab, the API returns a 404 error and aborts with:

```
The username <username> doesn't exist on GitHub.
```

While `addContributorWithDetails` exists internally in
`src/contributors/addWithDetails.js`, the command-line interface does not expose
options to supply contributor metadata (name, avatar, profile URL) directly or
to bypass remote API lookups.

## Proposed Solution

### 1. CLI Options in `src/cli.js`

Add command-line options for `all-contributors add`:

- `--name <name>`: Manually specify the contributor's display name.
- `--avatar-url <url>` (alias: `--avatar`): Manually specify the contributor's
  avatar image URL.
- `--profile <url>`: Manually specify the contributor's profile, organization,
  or website URL.
- `--no-fetch`: Skip querying the remote platform API, using the provided flags
  or default fallbacks.

### 2. Contributor Resolution in `src/contributors/index.js`

In `addContributor(options, username, contributions)`:

- If `options.noFetch`, `options.name`, `options.avatarUrl`,
  `options.avatar_url`, or `options.profile` is specified, use an in-memory
  resolver instead of querying `repo.getUserInfo`.
- The resolver returns:
  - `login`: username / identifier provided.
  - `name`: `options.name || username`.
  - `avatar_url`:
    `options.avatarUrl || options.avatar_url || 'https://avatars.githubusercontent.com/u/0?v=4'`.
  - `profile`: `options.profile || ''` (when empty, `format-contributor.js`
    automatically uses `avatarBlockTemplateNoProfile` without a broken link).

### 3. Verification Plan

- Unit tests verifying:
  - Adding a contributor with `--name`, `--avatar-url`, and `--profile` bypasses
    network requests and writes the correct metadata to `.all-contributorsrc`.
  - Adding a contributor with `--no-fetch` does not hit GitHub/GitLab API.
  - Generating contributor table with no profile produces valid HTML markup
    using `avatarBlockTemplateNoProfile`.
- Full test suite execution with `npm test -- --run`.
- Code formatting and linting check with `npm run lint`.
