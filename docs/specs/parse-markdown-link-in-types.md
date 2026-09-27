# Specification: Support Markdown Links in Custom Contribution Types (Issue #520)

## Context & Motivation

In
[all-contributors/cli#520](https://github.com/all-contributors/cli/issues/520),
users configuring custom contribution types in `.all-contributorsrc` reported
that markdown strings in `types.<key>.link` (such as recommended in the official
documentation: `"link": "[<%= symbol %>](<%= url %> \"<%= description %>\")"`)
were injected verbatim into the `href` attribute of the generated `<a>` element:

```html
<a
  href="[🏵️](https://github.com/orgs/LEGO/teams/bricklink-portal)"
  title="Core team"
>
  🏵️
</a>
```

This produced invalid HTML anchor elements with broken URLs.

## Root Cause

In `src/generate/format-contribution-type.js`:

```javascript
if (contribution.url) {
  url = contribution.url
} else if (type.link) {
  url = util.template(type.link)(templateData)
}

return linkTemplate({url, ...templateData})
```

The generator expects `url` to be a plain URI, but both existing documentation
examples and users frequently supply markdown link syntax `[label](url)` or
`[label](url "title")`.

## Proposed Solution

1. When evaluating `type.link`, parse the rendered string for markdown link
   patterns: `/^\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/`.
2. If it matches:
   - Extract the target URL to be used as `url`.
   - If a custom label is specified (`match[1]`), update `templateData.symbol`.
   - If an optional title attribute is specified (`match[3]`), update
     `templateData.description`.
3. If it does not match (e.g. plain URL like `https://example.com`), use the
   rendered string as `url` directly.
4. Add unit tests in `src/generate/__tests__/format-contribution-type.js`
   verifying:
   - Plain URLs work as expected.
   - Markdown links `[symbol](url)` are parsed with the clean URL in `href`.
   - Markdown links with titles `[symbol](url "title")` are parsed correctly.
