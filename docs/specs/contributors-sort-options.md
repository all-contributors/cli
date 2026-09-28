# Spec: Flexible Contributor Sorting Options

## Context & Motivation

Issue:
[all-contributors/cli#320](https://github.com/all-contributors/cli/issues/320)  
Requested by @tenshiAMD and approved by @Berkmann18:

> "I suggest having more options for sorting contributors... Options: none
> (default), username, number of contribution types. Types: ascending (default),
> descending (with minus sign or sortOrder)."

Currently, `all-contributors-cli` only supports:

- Insertion order (default, `contributorsSortAlphabetically: false`)
- Alphabetical sort by display name (`contributorsSortAlphabetically: true`)

Projects frequently desire to:

1. Sort by username/login (e.g. for repositories where usernames are the primary
   identifier).
2. Sort by number of contributions in descending order to showcase top
   contributors.
3. Sort in descending order without manual reordering.
4. Support locale-sensitive string comparison for international names.

## Proposed Design

### 1. Configuration Options (`.all-contributorsrc`)

- **`contributorsSortBy`** (string, default: `"none"`):
  - `"none"`: Preserve order of contributors as specified in the configuration.
  - `"name"`: Sort by contributor's display name (`name` with fallback to
    `login`).
  - `"username"` or `"login"`: Sort by contributor's handle (`login` with
    fallback to `name`).
  - `"contributions"`: Sort by number of contribution types
    (`contributor.contributions.length`).
  - Prefix with `-` for descending order (e.g. `"-username"`,
    `"-contributions"`).
- **`contributorsSortOrder`** (string, optional: `"asc"` | `"desc"`, default:
  `"asc"`):
  - Overrides sort direction explicitly (takes precedence or works together with
    `contributorsSortBy`).
- **`sortLocale`** or **`docsLocale`** (string, optional):
  - Locale tag passed to `localeCompare(..., locale, { sensitivity: 'base' })`
    for accurate collation.
- **Backward Compatibility**:
  - If `contributorsSortAlphabetically: true` is configured and
    `contributorsSortBy` is not set, it is treated as
    `contributorsSortBy: "name"`.

### 2. CLI Options (`src/cli.js`)

- `--sortBy <name|username|contributions>`: Sets `argv.contributorsSortBy`.
- `--sortOrder <asc|desc>`: Sets `argv.contributorsSortOrder`.

### 3. Implementation Details

Create `src/util/sort-contributors.js`:

- Export `sortContributors(contributors, options)`:
  - Determines field (`name`, `username`, `contributions`) and direction (`asc`
    / `desc`).
  - Handles tie-breakers and missing fields gracefully.
  - Uses `localeCompare` with base sensitivity for case-insensitive and
    diacritic-friendly alphabetical comparison.

In `src/generate/index.js`:

- Replace the inline `sortedContributors.sort(...)` with
  `sortContributors(contributors, options)`.

## Verification Plan

1. Unit tests in `src/util/__tests__/sort-contributors.js`:
   - Sort by username (asc and desc with `-username` or
     `contributorsSortOrder: "desc"`).
   - Sort by name (asc and desc).
   - Sort by contribution counts (asc and desc with `-contributions`).
   - Case-insensitivity and locale collation.
   - Backward compatibility with `contributorsSortAlphabetically`.
2. Full test suite execution with `npm test -- --run`.
3. ESLint and Prettier verification via `npm run lint`.
