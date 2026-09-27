# Specification: Case-Insensitive and Locale-Aware Contributor Sorting (Issues #370 & #349)

## Context & Motivation

1. **Issue #370**: In
   [all-contributors/cli#370](https://github.com/all-contributors/cli/issues/370),
   users reported that `contributorsSortAlphabetically` performs an unintuitive
   sort where capitalized names A-Z sort before lowercase names a-z (e.g.,
   `["Alice", "Bob", "charlie", "david"]`). A case-insensitive sort produces
   natural alphabetical ordering.
2. **Issue #349**: In
   [all-contributors/cli#349](https://github.com/all-contributors/cli/issues/349),
   users reported that alphabetical sorting did not respect non-ASCII language
   rules or user-configured locales (such as Czech or Portuguese), causing
   accented characters to be sorted awkwardly without locale configuration.
3. **Missing Name Fallback**: When contributors in `.all-contributorsrc` do not
   specify a `name` property or have an empty string, previous logic compared
   `(a.name || '')`, sorting all nameless contributors at the top of the table
   instead of utilizing their `login` identifier.

## Proposed Changes

### 1. `src/generate/index.js`

Update `sortedContributors.sort` under `options.contributorsSortAlphabetically`:

```javascript
const sortedContributors = [...contributors]
if (options.contributorsSortAlphabetically) {
  const locale =
    options.sortLocale || options.locale || options.docsLocale || undefined
  sortedContributors.sort((a, b) => {
    const nameA = a.name || a.login || ''
    const nameB = b.name || b.login || ''
    return (
      nameA.localeCompare(nameB, locale, {
        sensitivity: 'accent',
        numeric: true,
      }) || nameA.localeCompare(nameB, locale, {numeric: true})
    )
  })
}
```

- **Case-Insensitive with Tie-Breaker**:
  `{ sensitivity: 'accent', numeric: true }` treats uppercase and lowercase
  versions of the same letter equally (e.g. `a === A`), placing `adam` next to
  `Alice`. If two names are identical except for case,
  `localeCompare(..., { numeric: true })` acts as a deterministic tie-breaker.
- **Login Fallback**: `a.name || a.login || ''` ensures contributors without
  explicit names are alphabetized by their GitHub/GitLab login rather than
  placed at the beginning as empty strings.
- **Configurable Locale**: Uses
  `options.sortLocale || options.locale || options.docsLocale`, enabling
  accurate locale-sensitive alphabetization.

### 2. `src/cli.js`

Add CLI option for `--sortLocale`:

```javascript
  .option('sortLocale', {
    type: 'string',
    description:
      'Locale to use for alphabetical sorting (e.g. en, cs, es)',
  })
```

### 3. Unit Tests (`src/generate/__tests__/index.js`)

- Add test for case-insensitive contributor sorting.
- Add test for fallback to `login` when `name` is undefined or empty.
- Add test for locale-specific character sorting (e.g. Czech).
