export function sortContributors(contributors, options = {}) {
  if (!Array.isArray(contributors)) {
    return []
  }

  const sorted = [...contributors]

  let sortBy =
    options.contributorsSortBy ||
    (options.contributorsSortAlphabetically ? 'name' : 'none')
  let sortOrder = options.contributorsSortOrder || 'asc'

  if (typeof sortBy === 'string' && sortBy.startsWith('-')) {
    sortBy = sortBy.slice(1)
    sortOrder = 'desc'
  }

  if (!sortBy || sortBy === 'none') {
    return sorted
  }

  const locale = options.sortLocale || options.docsLocale || undefined
  const compareStrings = (strA, strB) =>
    (strA || '').localeCompare(strB || '', locale, {sensitivity: 'base'})

  sorted.sort((a, b) => {
    let comparison = 0

    if (sortBy === 'username' || sortBy === 'login') {
      const aVal = a.login || a.name || ''
      const bVal = b.login || b.name || ''
      comparison = compareStrings(aVal, bVal)
    } else if (sortBy === 'name') {
      const aVal = a.name || a.login || ''
      const bVal = b.name || b.login || ''
      comparison = compareStrings(aVal, bVal)
    } else if (sortBy === 'contributions') {
      const aCount = Array.isArray(a.contributions) ? a.contributions.length : 0
      const bCount = Array.isArray(b.contributions) ? b.contributions.length : 0
      comparison = aCount - bCount
      // Tie-breaker by name
      if (comparison === 0) {
        comparison = compareStrings(a.name || a.login, b.name || b.login)
      }
    }

    return sortOrder === 'desc' ? -comparison : comparison
  })

  return sorted
}
