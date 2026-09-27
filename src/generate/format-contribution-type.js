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
    const rawLink = util.template(type.link)(templateData).trim()
    const markdownMatch = /^\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/.exec(rawLink)
    if (markdownMatch) {
      if (markdownMatch[1]) {
        templateData.symbol = markdownMatch[1]
      }
      url = markdownMatch[2]
      if (markdownMatch[3]) {
        templateData.description = markdownMatch[3]
      }
    } else {
      url = rawLink
    }
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
