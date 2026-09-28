# Spec: Add Missing Contributors to CLI Repository

## Context & Motivation

Issue:
[all-contributors/cli#462](https://github.com/all-contributors/cli/issues/462)  
Title: **Add missing contributors to the cli**

Running `all-contributors check` against the `all-contributors/cli` repository
reports contributors whose commits and pull requests were merged into the
repository but who were never recognized in `.all-contributorsrc` and
`README.md`.

## Contributors to Add

Based on merged pull requests in `all-contributors/cli`:

1. **alexwlchan** (Alex Chan)
   - PR: #249
     (`feat(alpha-sort): Add a parameter contributorsSortAlphabetically`)
   - Contributions: `code`
   - Profile: `https://github.com/alexwlchan`

2. **davidmenendez** (David Menendez)
   - PR: #85 (`fix: surface the message when the check api returns an error`)
   - Contributions: `code`
   - Profile: `https://github.com/davidmenendez`

3. **dayjoyx** (dayjoy)
   - PR: #95 (`support Gitlab self hosted instance`)
   - Contributions: `code`
   - Profile: `https://github.com/dayjoyx`

4. **erdahuja** (Deepak)
   - PR: #171 (`fix: add common error handling for missing or wrong username`)
   - Contributions: `code`
   - Profile: `https://github.com/erdahuja`

5. **hpierre74** (Pierre Huyghe)
   - PR: #307 (`refactor: add tbody to contributors table`)
   - Contributions: `code`
   - Profile: `https://github.com/hpierre74`

6. **jamesplease** (James Please)
   - PR: #45 (`Add new contribution type: Ideas & Planning`)
   - Contributions: `ideas`, `code`
   - Profile: `https://github.com/jamesplease`

7. **jas0ncn** (Jason Chen)
   - PR: #116 (`docs: remove unnecessary space to avoid generation failures`)
   - Contributions: `doc`
   - Profile: `https://github.com/jas0ncn`

8. **jtoar** (Dominic Saadi)
   - PR: #309 (`fix: trim nextLink before slicing`)
   - Contributions: `code`
   - Profile: `https://github.com/jtoar`

9. **kevinvangelder** (Kevin VanGelder)
   - PR: #75 (`Added platform type`)
   - Contributions: `code`
   - Profile: `https://github.com/kevinvangelder`

10. **KirstieJane** (Kirstie Whitaker)
    - PR: #114 (`Add note about using npx cli command to README`)
    - Contributions: `doc`
    - Profile: `https://github.com/KirstieJane`

11. **tunnckoCore** (Charlike Mike Reagent)
    - PR: #51 (`add script for easier access`)
    - Contributions: `tool`
    - Profile: `https://github.com/tunnckoCore`

12. **tyler-reitz** (Tyler Reitz)
    - PRs: #94, #96, #100 (`Enhancement/common errors files overridden`,
      `adds ability to remove contribution types`)
    - Contributions: `code`, `test`
    - Profile: `https://github.com/tyler-reitz`

13. Update GitHub handle rename: `tigermarques` -> `jgsmarques`
14. Normalize login case: `Favna` -> `favna`

## Verification Plan

1. Regenerate `README.md` using `all-contributors generate`.
2. Run `npm test -- --run` to ensure all tests pass.
3. Run `npm run lint` to ensure code style and markdown formatting compliance.
