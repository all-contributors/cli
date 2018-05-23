const _ = require('lodash/fp')

function uniqueTypes(contribution) {
  return contribution.type || contribution
}

function formatContributions(options, existing, types) {
  if (options.url) {
    return (existing || []).concat(
      types.map(type => {
        return {type, url: options.url}
      }),
    )
  }
  return _.uniqBy(uniqueTypes, (existing || []).concat(types))
}

function updateContributor(options, contributor, contributions) {
  return _.assign(contributor, {
    contributions: formatContributions(
      options,
      contributor.contributions,
      contributions,
    ),
  })
}

function updateExistingContributor(options, username, contributions) {
  return options.contributors.map(contributor => {
    if (
      !contributor.login ||
      username.toLowerCase() !== contributor.login.toLowerCase()
    ) {
      return contributor
    }
    return updateContributor(options, contributor, contributions)
  })
}

function addNewContributor(options, username, contributions, infoFetcher) {
  return infoFetcher(username, options.repoType, options.repoHost).then(userData => {
    const contributor = _.assign(userData, {
      contributions: formatContributions(options, [], contributions),
    })
    return options.contributors.concat(contributor)
  })
}

module.exports = function addContributor(
  options,
  username,
  contributions,
  infoFetcher,
) {
  // case insensitive find
  const exists = _.find(contributor => {
    return (
      contributor.login &&
      contributor.login.toLowerCase() === username.toLowerCase()
    )
  }, options.contributors)

  if (exists) {
    return Promise.resolve(
      updateExistingContributor(options, username, contributions),
    )
  }
  return addNewContributor(options, username, contributions, infoFetcher)
}
