const _ = require('lodash/fp')

const util = require('../util')

const linkTemplate = _.template(
  '<a href="<%= url %>" title="<%= description %>"><%= symbol %></a>',
)

function getType(options, contribution) {
  const types = util.contributionTypes(options)
  return types[contribution.type || contribution]
}

module.exports = function formatContribution(
  options,
  contributor,
  contribution,
) {
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
    description: type.description,
    contributor,
    options,
  }

  let url = getUrl(contribution, contributor)

  if (contribution.url) {
    url = contribution.url
  } else if (type.link) {
    url = _.template(type.link)(templateData)
  }

  return linkTemplate(_.assign({url}, templateData))
}

function getUrl(contribution, contributor) {
  if (contributor.login) {
    return `#${contribution}-${contributor.login}`
  } else {
    return `#${contribution}`
  }
}
