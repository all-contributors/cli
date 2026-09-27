# Spec: Markdownlint Opt-Out in Generated Contributors List

## Background & Problem

Issue: https://github.com/all-contributors/cli/issues/540 Reported by Josh
Goldberg (@JoshuaKGoldberg):

> `injectListBetweenTags` always inserts `<!-- markdownlint-disable -->` /
> `<!-- markdownlint-restore -->`, with no way to opt out. For repos that don't
> use markdownlint these are just noise, and they get re-added on every run even
> after being removed. Repos that generate or check their README content, such
> as templates, can't keep the table in sync without also emitting markdownlint
> comments. Suggested solution:
>
> 1. A config option to skip them, e.g. `"markdownlint": false` in
>    `.all-contributorsrc`
> 2. Preserve whatever is already between the list tags: only emit the
>    markdownlint comments if the existing list already has them (or when
>    creating a new list via init)

## Proposed Solution

1. **Config Option**:
   - Support `markdownlint?: boolean` in `.all-contributorsrc` and CLI options
     (`--no-markdownlint` / `--markdownlint`).
   - If `markdownlint === false`, omit `<!-- markdownlint-disable -->` and
     `<!-- markdownlint-restore -->`.
   - If `markdownlint === true`, always include them.
2. **Preserve Existing Tags**:
   - If `markdownlint` is not explicitly set (`undefined`), inspect the existing
     content between `<!-- ALL-CONTRIBUTORS-LIST:START -->` and
     `<!-- ALL-CONTRIBUTORS-LIST:END -->`.
   - If the existing list already has `<!-- prettier-ignore-start -->` but omits
     `<!-- markdownlint-disable -->`, preserve that preference by defaulting
     `useMarkdownlint = false`.
   - Otherwise, default to `true` to maintain complete backward compatibility
     with all existing repositories.
3. **CLI & Declarations**:
   - Add `--markdownlint` boolean option in `src/cli.js`.
   - Add `markdownlint?: boolean` in `src/index.d.ts` (if exists or in typings).
4. **Unit Tests**:
   - Test generating table with `options.markdownlint: false` ensures
     `<!-- markdownlint-disable -->` and `<!-- markdownlint-restore -->` are
     omitted.
   - Test generating table with `options.markdownlint: true` includes them.
   - Test automatic preservation: when existing markdown lacks markdownlint
     comments but has prettier-ignore, markdownlint comments are omitted.
   - Test backward compatibility: when existing markdown is initial/raw,
     markdownlint comments are included by default.
