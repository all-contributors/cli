# Spec: Internationalization (i18n) of Documentation Links

- **Issue:**
  [#115 - Internacionalization](https://github.com/all-contributors/cli/issues/115)
- **Status:** Approved / In Progress
- **Authors:** Matheus Breguêz <matbrgz@gmail.com>, Antigravity
  <noreply@google.com>

---

## 1. Context and Problem Statement

`all-contributors-cli` hardcodes English (`en`) documentation URLs in several
places:

1. `src/init/init-content.js`:
   `'Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):'`
2. `src/generate/index.js` (`formatFooter`):
   `const linkToBotAdd = 'https://all-contributors.js.org/docs/en/bot/usage'`
3. `src/generate/format-contribution-type.js`: Contribution symbols without an
   explicit commit/issue/pulls link (`repo.getLinkTo*`) default to local
   fragment identifiers (`#<contribution>-<login>`). Projects cannot currently
   configure contribution icons to link directly to localized documentation on
   `allcontributors.org` (e.g.
   `https://allcontributors.org/docs/<locale>/emoji-key#<type>`).

The allcontributors.org documentation is translated into multiple languages
(e.g., `pt-BR`, `es-ES`, `fr`, `de`, `ja`, `zh-CN`, `ko`, etc.). Projects
maintaining documentation in non-English locales or bilingual repositories need
a way to configure the documentation locale so that generated links reflect
their chosen language.

---

## 2. Goals & Non-Goals

### Goals

- Allow configuring documentation locale via `.all-contributorsrc` (`docsLocale`
  or `locale`) and CLI flags (`--docsLocale`, `--locale`).
- Default locale is `'en'` to ensure 100% backwards compatibility with all
  existing repositories, tests, and snapshot outputs.
- Update table footer "Add your contributions" link (`formatFooter`) to use the
  configured `docsLocale`.
- Update initialization header (`init-content.js`) to use the configured
  `docsLocale` (`https://allcontributors.org/docs/<docsLocale>/emoji-key`).
- Update `generate` to update existing
  `[emoji key](https://allcontributors.org/docs/<oldLocale>/emoji-key)` links in
  files when `docsLocale` is specified.
- Support `linkToDocs` (boolean, default `false`) in `formatContributionType` to
  allow contribution icons without dedicated repo links to link to
  `https://allcontributors.org/docs/<docsLocale>/emoji-key#<type>`.
- Expose `docsLocale` in template evaluation data so custom contribution types
  and templates can interpolate `<%= docsLocale %>` or
  `<%= options.docsLocale %>`.
- Allow optional `docsLinkTemplate` for custom doc URL patterns.

### Non-Goals

- Full translation of the CLI command line prompts into every language (CLI
  prompts remain in English; only documentation links and rendered outputs are
  localized).
- Breaking existing behavior or existing snapshot output when no `docsLocale` is
  specified.

---

## 3. Configuration & Options Contract

### `.all-contributorsrc`

```json
{
  "projectName": "my-project",
  "projectOwner": "my-org",
  "repoType": "github",
  "docsLocale": "pt-BR",
  "linkToDocs": false,
  "docsLinkTemplate": "https://allcontributors.org/docs/<%= docsLocale %>/emoji-key#<%= contribution %>",
  "files": ["README.md"],
  "contributors": []
}
```

- `docsLocale` _(string, optional, default: `'en'`)_: The locale used when
  linking to documentation on `allcontributors.org` (e.g., `'pt-BR'`, `'es-ES'`,
  `'fr'`).
- `locale` _(string, optional)_: Alias for `docsLocale`.
- `linkToDocs` _(boolean, optional, default: `false`)_: If `true`, contribution
  icons that do not have dedicated repo links (e.g., commits/issues) link to
  `https://allcontributors.org/docs/<docsLocale>/emoji-key#<type>` instead of
  `#<type>-<login>`.
- `docsLinkTemplate` _(string, optional)_: Custom template for doc links when
  `linkToDocs` is enabled.

### CLI Flags

- `--docsLocale <locale>`: Set doc locale (e.g. `--docsLocale pt-BR`).
- `--locale <locale>`: Alias for `--docsLocale`.
- `--linkToDocs`: Enable linking emoji icons to documentation.

---

## 4. Implementation Details

1. **`src/util/config-file.js`**:
   - Ensure `docsLocale` is defaulted or normalized
     (`config.docsLocale = config.docsLocale || config.locale || 'en'`).

2. **`src/cli.js`**:
   - Add `--docsLocale`, `--locale`, and `--linkToDocs` options in `getArgs()`.
   - Normalize `argv.docsLocale = argv.docsLocale || argv.locale || 'en'`.

3. **`src/generate/format-contribution-type.js`**:
   - Compute `docsLocale = options.docsLocale || options.locale || 'en'`.
   - Pass `docsLocale` in `templateData`.
   - In `getUrl(options, contribution, contributor)`:
     - If `options.linkToDocs` is `true`:
       - If `options.docsLinkTemplate`: evaluate template with `templateData`.
       - Else: return
         `https://allcontributors.org/docs/${docsLocale}/emoji-key#${contributionKey}`.
     - Else: maintain existing anchor `#${contributionKey}-${contributor.login}`
       / `#${contributionKey}`.

4. **`src/generate/index.js`**:
   - In `formatFooter(options)`:
     - `const docsLocale = options.docsLocale || options.locale || 'en'`.
     - `const linkToBotAdd = 'https://all-contributors.js.org/docs/' + docsLocale + '/bot/usage'`.
   - In `generate(options, contributors, fileContent)`:
     - Replace existing emoji key links if present:
       `replaceEmojiKeyLink(fileContent, docsLocale)`.

5. **`src/init/init-content.js`**:
   - Export `getHeaderContent(docsLocale = 'en')`.
   - In `addContributorsListImpl(lines, options = {})`:
     - Use `getHeaderContent(options.docsLocale || options.locale || 'en')`.

6. **`src/init/prompt.js`**:
   - Add prompt question for `docsLocale` (default: `'en'`).
   - Include `docsLocale` in generated config.

---

## 5. Test Cases

1. **`format-contribution-type.js`**:
   - Preserves default anchor link (`#tool-kentcdodds`) when `linkToDocs` is
     falsy.
   - Generates default English docs link
     (`https://allcontributors.org/docs/en/emoji-key#tool`) when
     `linkToDocs: true`.
   - Generates localized docs link
     (`https://allcontributors.org/docs/pt-BR/emoji-key#tool`) when
     `linkToDocs: true` and `docsLocale: 'pt-BR'`.
   - Supports `locale` alias (`locale: 'es-ES'`).
   - Supports `docsLinkTemplate` custom template interpolation.
   - Allows custom types to interpolate `<%= docsLocale %>`.

2. **`format-footer` (`index.js`)**:
   - Renders `https://all-contributors.js.org/docs/en/bot/usage` with default
     options.
   - Renders `https://all-contributors.js.org/docs/pt-BR/bot/usage` with
     `docsLocale: 'pt-BR'`.

3. **`init-content.js`**:
   - Generates English emoji-key link by default.
   - Generates localized emoji-key link when `docsLocale` is passed.

4. **`generate` integration (`index.js`)**:
   - Regenerating updates
     `[emoji key](https://allcontributors.org/docs/.../emoji-key)` in the file
     when `docsLocale` is changed.
   - All existing snapshot tests pass without regression.
