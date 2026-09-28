# Spec: Support Codeberg, Gitea, and Forgejo Repositories

## Context & Motivation

Issues:

- [all-contributors/cli#444](https://github.com/all-contributors/cli/issues/444):
  "Support Codeberg (forgejo) repositories"
- [all-contributors/cli#368](https://github.com/all-contributors/cli/issues/368):
  "Support gitea/forgejo"

Currently, `all-contributors-cli` only supports repositories hosted on GitHub
(`repoType: "github"`) and GitLab (`repoType: "gitlab"`). A substantial number
of open source projects and communities host their source code on
[Codeberg.org](https://codeberg.org/), self-hosted or managed
[Forgejo](https://forgejo.org/) instances, and [Gitea](https://gitea.com/)
instances.

Because Gitea, Forgejo, and Codeberg share a unified REST API specification
(`/api/v1/...`), native support for all three can be provided through a shared
API client implementation.

## Detailed Requirements

### 1. Supported Repo Types

Add the following entries to `SUPPORTED_REPO_TYPES` in `src/repo/index.js`:

- **`gitea`**:
  - `name`: 'Gitea'
  - `checkKey`: 'login'
  - `defaultHost`: 'https://gitea.com'
  - `linkToCommits`:
    `'<%= options.repoHost || "https://gitea.com" %>/<%= options.projectOwner %>/<%= options.projectName %>/commits'`
  - `linkToIssues`:
    `'<%= options.repoHost || "https://gitea.com" %>/<%= options.projectOwner %>/<%= options.projectName %>/issues?poster=<%= contributor.login %>'`
  - `linkToReviews`:
    `'<%= options.repoHost || "https://gitea.com" %>/<%= options.projectOwner %>/<%= options.projectName %>/pulls?poster=<%= contributor.login %>'`
- **`forgejo`**:
  - `name`: 'Forgejo'
  - `checkKey`: 'login'
  - `defaultHost`: 'https://codeberg.org'
  - `linkToCommits`:
    `'<%= options.repoHost || "https://codeberg.org" %>/<%= options.projectOwner %>/<%= options.projectName %>/commits'`
  - `linkToIssues`:
    `'<%= options.repoHost || "https://codeberg.org" %>/<%= options.projectOwner %>/<%= options.projectName %>/issues?poster=<%= contributor.login %>'`
  - `linkToReviews`:
    `'<%= options.repoHost || "https://codeberg.org" %>/<%= options.projectOwner %>/<%= options.projectName %>/pulls?poster=<%= contributor.login %>'`
- **`codeberg`**:
  - `name`: 'Codeberg'
  - `checkKey`: 'login'
  - `defaultHost`: 'https://codeberg.org'
  - `linkToCommits`:
    `'<%= options.repoHost || "https://codeberg.org" %>/<%= options.projectOwner %>/<%= options.projectName %>/commits'`
  - `linkToIssues`:
    `'<%= options.repoHost || "https://codeberg.org" %>/<%= options.projectOwner %>/<%= options.projectName %>/issues?poster=<%= contributor.login %>'`
  - `linkToReviews`:
    `'<%= options.repoHost || "https://codeberg.org" %>/<%= options.projectOwner %>/<%= options.projectName %>/pulls?poster=<%= contributor.login %>'`

### 2. Gitea/Forgejo/Codeberg API Implementation (`src/repo/gitea.js`)

- `getUserInfo(username, hostname, optionalPrivateToken)`:
  - Hits `${hostname.replace(/\/$/, '')}/api/v1/users/${username}`.
  - Sends headers: `User-Agent: 'node-fetch'` and
    `Authorization: token ${optionalPrivateToken}` when provided.
  - Returns contributor info object:
    - `login`: `body.login || username`
    - `name`: `body.full_name || body.login || username`
    - `avatar_url`: `body.avatar_url`
    - `profile`: `body.website` if valid HTTP URL, else `body.html_url` or
      `${hostname}/${username}`
- `getContributors(owner, name, hostname, optionalPrivateToken)`:
  - Hits
    `${hostname.replace(/\/$/, '')}/api/v1/repos/${owner}/${name}/commits?limit=100`.
  - Paginates using standard `Link` header (`rel="next"`).
  - Collects unique authors from `commit.author.login` or
    `commit.commit.author.name`.

### 3. Interactive CLI Initialization (`src/init/prompt.js`)

- Update choices in `repoType` prompt to include Codeberg, Gitea, and Forgejo.
- Replace hardcoded conditional default for `repoHost` with
  `repo.getHostname(answers.repoType)`.

### 4. Testing & Verification

- Unit test suite `src/repo/__tests__/gitea.js` testing both `getUserInfo` and
  `getContributors` with mocked fetch responses.
- Update `src/repo/__tests__/index.js` to ensure all 5 repo types are properly
  exported and resolved.
- Full test pass across Vitest and ESLint/Prettier.
