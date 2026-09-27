function uniqueTypes(contribution) {
  return contribution.type || contribution
}

function formatContributions(options, existing = [], types) {
  if (options.url) {
    const newTypesWithUrl = types.map(type => ({type, url: options.url}))
    if (options.replace) {
      return newTypesWithUrl
    }
    const combined = existing.concat(newTypesWithUrl)
    return combined.filter(
      (item, index, arr) =>
        index ===
        arr.findIndex(other => uniqueTypes(other) === uniqueTypes(item)),
    )
  }

  if (options.replace) {
    return types.map(type => {
      const existingMatch = existing.find(
        item => uniqueTypes(item) === uniqueTypes(type),
      )
      return existingMatch || type
    })
  }

  const combined = existing.concat(types)
  return combined.filter(
    (item, index, arr) =>
      index ===
      arr.findIndex(other => uniqueTypes(other) === uniqueTypes(item)),
  )
}

function updateContributor(options, contributor, contributions) {
  return {
    ...contributor,
    contributions: formatContributions(
      options,
      contributor.contributions,
      contributions,
    ),
  }
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
  return infoFetcher(username, options.repoType, options.repoHost).then(
    userData => {
      const contributor = {
        ...userData,
        contributions: formatContributions(options, [], contributions),
      }
      return options.contributors.concat(contributor)
    },
  )
}

export function add(options, username, contributions, infoFetcher) {
  // case insensitive find
  const exists = options.contributors.find(contributor => {
    return (
      contributor.login &&
      contributor.login.toLowerCase() === username.toLowerCase()
    )
  })

  if (exists) {
    return Promise.resolve(
      updateExistingContributor(options, username, contributions),
    )
  }
  return addNewContributor(options, username, contributions, infoFetcher)
}
