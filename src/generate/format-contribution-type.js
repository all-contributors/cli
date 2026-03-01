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

  if (contribution.url) {
    url = contribution.url
  } else if (type.link) {
    url = util.template(type.link)(templateData)
  }

  return linkTemplate({url, ...templateData})
}

function getUrl(contribution, contributor) {
  if (contributor.login) {
    return `#${contribution}-${contributor.login}`
  } else {
    return `#${contribution}`
  }
}
