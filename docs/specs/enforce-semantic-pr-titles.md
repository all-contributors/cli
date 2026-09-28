# Spec: Enforce Semantic / Conventional PR Titles in CI

## Context & Motivation

Issue:
[all-contributors/cli#482](https://github.com/all-contributors/cli/issues/482)  
Maintainer Leah Wasser (@lwasser) proposed:

> "Consider adding a PR title checker to enforce angular / conventional
> commits... To check for conventional commit standards in our pr titles. This
> could be useful as a reminder to fix pr titles before we merge. It's an easy
> fix, but also a very easy thing to forget when creating a new pr!! (I wouldn't
> mind the reminder)."

The CLI repository uses
[Google's Release Please](https://github.com/googleapis/release-please-action)
(`.github/workflows/release-please.yml`) configured via
`release-please-config.json`. When PRs are squash-merged into `main`, Release
Please parses the squash commit message (which defaults to the PR title) to
determine:

1. Semver version bumps (`feat:` -> minor, `fix:` -> patch, `BREAKING CHANGE:`
   -> major).
2. Categorized changelog entries (`🚀 New Features`, `🔥 Bug Fixes`,
   `📚 Documentation`, etc.).

If a pull request is merged with an invalid title (e.g., "Updated readme" or
"WIP"), Release Please either ignores the contribution in `CHANGELOG.md` or
fails to bump the version correctly.

## Requirements

### 1. GitHub Action Workflow

Create `.github/workflows/lint-pr-title.yml`:

- Trigger on `pull_request_target` events:
  `[opened, edited, synchronize, reopened]`.
- Use `amannn/action-semantic-pull-request@v5`.
- Provide read access to pull requests: `permissions: pull-requests: read`.
- Configure allowed types strictly aligned with `release-please-config.json`:
  - `feat`
  - `enh`
  - `fix`
  - `perf`
  - `revert`
  - `docs`
  - `style`
  - `chore`
  - `refactor`
  - `test`
  - `build`
  - `ci`
- Allow optional scopes: e.g. `feat(config): ...`, `fix(repo): ...`.
- Reject empty descriptions or missing types.

### 2. Documentation Update

Update `DEVELOPMENT.md`:

- Document PR title requirements in the contributing / release section.
- Explain the connection between PR titles, Conventional Commits, and automated
  Release Please changelog generation.

## Verification Plan

- Validate workflow YAML syntax.
- Run `npm run lint` to ensure Prettier/ESLint passes on all repository files.
