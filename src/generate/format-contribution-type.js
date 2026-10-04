import * as util from '../util/index.js'

const linkTemplate = util.template(
  '<a href="<%= url %>" title="<%= description %>"><%= symbol %></a>',
)

function getType(options, contribution) {
  const types = util.contributionTypes(options)
  return types[contribution.type || contribution]
}

export function formatContributionType(options, contributor, contribution) {
  const type = getType(options, contribution)

  if (!type) {
    throw new Error(
      `Unknown contribution type ${contribution} for contributor ${
        contributor.login || contributor.name
      }`,
    )
  }

  const templateData = {
    symbol: type.symbol,
    description: type.description || '',
    contributor,
    options,
  }

  let url = getUrl(contribution, contributor)
  let symbol = templateData.symbol

  if (contribution.url) {
    url = contribution.url
  } else if (type.link) {
    const resolved = resolveContributionLink(
      util.template(type.link)(templateData),
      symbol,
    )
    url = resolved.url
    symbol = resolved.symbol
  }

  return linkTemplate({url, symbol, description: templateData.description})
}

/**
 * Custom types often document `link` as a markdown badge, e.g.
 * `[<%= symbol %>](https://example.com)`. The HTML template expects a bare
 * URL for `href`, so extract the URL (and optional label) when markdown is used.
 */
function resolveContributionLink(templatedLink, fallbackSymbol) {
  const markdownMatch = /^\[([^\]]*)\]\(([^)\s]+)\)$/.exec(
    String(templatedLink).trim(),
  )
  if (markdownMatch) {
    return {
      symbol: markdownMatch[1] || fallbackSymbol,
      url: markdownMatch[2],
    }
  }

  return {symbol: fallbackSymbol, url: templatedLink}
}

function getUrl(contribution, contributor) {
  if (contributor.login) {
    return `#${contribution}-${contributor.login}`
  } else {
    return `#${contribution}`
  }
}
