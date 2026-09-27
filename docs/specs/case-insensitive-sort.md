# Spec: Case-Insensitive Alphabetical Sorting and Login Fallback (#370)

## 1. Overview & Problem

In `all-contributors-cli`, the `--contributorsSortAlphabetically` option sorts
contributors alphabetically when generating the contributors table.

Prior to this fix, the sorting logic in `src/generate/index.js` was:

```javascript
if (options.contributorsSortAlphabetically) {
  sortedContributors.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}
```

This produced two issues reported in #370:

1. **Case sensitivity**: Depending on collation or when names had mixed
   capitalization, uppercase names would group together or sort inconsistently
   with lowercase names (e.g. `['Bob', 'alice']`), leading to non-intuitive
   ordering.
2. **Missing `name` fallback**: In `formatContributor`
   (`src/generate/format-contributor.js`), the displayed name defaults to
   `contributor.name || contributor.login`. When a contributor object in
   `.all-contributorsrc` did not have an explicit `name` attribute (or it was
   empty), `(a.name || '')` resulted in `""`, placing that contributor before
   all named contributors regardless of their `login` handle.

## 2. Goals & Solution

- Sort contributors alphabetically using a case-insensitive comparison
  (`{sensitivity: 'base'}`).
- If two names are identical under base sensitivity, use standard
  `localeCompare` as a tie-breaker for deterministic ordering.
- Fall back to `contributor.login` when `contributor.name` is missing or empty,
  ensuring consistency with the rendered contributor label.
- Add unit tests verifying both case-insensitive sorting and login fallback.

## 3. Implementation Details

In `src/generate/index.js`:

```javascript
if (options.contributorsSortAlphabetically) {
  sortedContributors.sort((a, b) => {
    const nameA = a.name || a.login || ''
    const nameB = b.name || b.login || ''
    const comparison = nameA.localeCompare(nameB, undefined, {
      sensitivity: 'base',
    })
    if (comparison !== 0) {
      return comparison
    }
    return nameA.localeCompare(nameB)
  })
}
```

In `src/generate/__tests__/index.js`:

- Add test case verifying contributors with lowercase and uppercase names
  (`alice`, `Bob`, `charlie`, `David`) sort in correct alphabetical order
  (`alice`, `Bob`, `charlie`, `David`).
- Add test case verifying contributors with missing `name` sort by `login`.

## 4. Verification

- Run test suite: `npm run test -- --run` (all unit tests must pass).
- Run linter: `npm run lint` (ESLint and Prettier must pass).
