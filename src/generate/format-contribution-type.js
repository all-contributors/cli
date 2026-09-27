import * as util from '../util/index.js'

const linkTemplate = util.template(
  '<a href="<%= url %>" title="<%= description %>"><%= symbol %></a>',
)

function getType(options, contribution) {
  const types = util.contributionTypes(options)
  return types[contribution.type || contribution]
}

function getDocsUrl(options, contributionKey, contributor, templateData) {
  const docsLocale = options?.docsLocale || options?.locale || 'en'
  if (options?.docsLinkTemplate) {
    return util.template(options.docsLinkTemplate)({
      ...templateData,
      docsLocale,
      contribution: contributionKey,
      contributor,
      options,
    })
  }
  return `https://allcontributors.org/docs/${docsLocale}/emoji-key#${contributionKey}`
}

function getUrl(options, contribution, contributor) {
  const contributionKey = contribution.type || contribution

  if (options?.linkToDocs) {
    return getDocsUrl(options, contributionKey, contributor, {
      contributor,
      options,
    })
  }

  if (contributor.login) {
    return `#${contributionKey}-${contributor.login}`
  } else {
    return `#${contributionKey}`
  }
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

  const docsLocale = options?.docsLocale || options?.locale || 'en'
  const contributionKey = contribution.type || contribution

  const templateData = {
    symbol: type.symbol,
    description: type.description || '',
    contributor,
    options: {
      ...options,
      docsLocale,
    },
    docsLocale,
    contribution: contributionKey,
  }

  let url = getUrl(options, contribution, contributor)

  if (contribution.url) {
    url = contribution.url
  } else if (options?.linkToDocs === 'all') {
    url = getDocsUrl(options, contributionKey, contributor, templateData)
  } else if (type.link) {
    url = util.template(type.link)(templateData)
  }

  return linkTemplate({url, ...templateData})
}
