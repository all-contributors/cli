# Specification: TypeScript Typings for `.all-contributorsrc` and Node API (Issue allcontributors.org#812)

## Context & Motivation

In
[all-contributors/allcontributors.org#812](https://github.com/all-contributors/allcontributors.org/issues/812)
and
[all-contributors/cli#362](https://github.com/all-contributors/cli/issues/362),
community members and maintainers (including Josh Goldberg) requested official
TypeScript declarations for:

1. The `.all-contributorsrc` configuration schema.
2. Contributor definitions and contribution types.
3. The Node API exported from `all-contributors-cli`.

Currently, developers writing tooling around All Contributors must manually
write or infer their own typings.

## Proposed Changes

### 1. `src/index.d.ts`

Provide complete TypeScript declarations:

- `ContributionType`: Union of all 34 canonical All Contributors contribution
  keys (`'code'`, `'doc'`, `'bug'`, `'review'`, `'infra'`, etc.) with open
  string fallback.
- `ContributorContribution`: Detailed contribution object
  `{ type: ContributionType | string; url?: string }`.
- `Contributor`:
  `{ login?: string; name: string; avatar_url: string; profile: string; contributions: (ContributionType | ContributorContribution)[] }`.
- `ContributionTypeDefinition`:
  `{ symbol: string; description: string; link?: string }`.
- `AllContributorsConfig`: Type declaration for `.all-contributorsrc`,
  including:
  - `$schema`, `projectName`, `projectOwner`, `repoType`, `repoHost`
  - `files`, `imageSize`, `contributorsPerLine`, `contributors`
  - `contributorsSortAlphabetically`, `sortLocale`, `docsLocale`, `linkToDocs`
  - `badgeTemplate`, `contributorTemplate`, `wrapperTemplate`
  - `commit`, `commitConvention`, `commitType`, `commitTemplate`, `skipCi`,
    `linkToUsage`
  - `types`: Record of custom contribution type definitions
- Node API declarations:
  - `addContributorWithDetails`:
    `(options: AllContributorsConfig, contributor: Contributor) => Promise<Contributor[]>`
  - `generate`:
    `(options: AllContributorsConfig, contributors: Contributor[], fileContent: string) => string`
  - `initContributorsList`: `(fileContent: string) => string`
  - `initBadge`: `(fileContent: string) => string`

### 2. `package.json`

Add `"types": "dist/index.d.ts"` to `package.json`. Because the build script
executes `cp -r src dist`, `src/index.d.ts` will automatically be copied to
`dist/index.d.ts` during build.

### 3. Verification

- Add a type verification test `src/__tests__/types.test.js` verifying that type
  interfaces match real output and configurations.
- Verify `tsc --noEmit` checks typings cleanly.
- Verify `npm test -- --run` and `npm run lint`.
