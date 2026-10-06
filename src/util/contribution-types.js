import {contributionTypes as builtInTypes} from 'all-contributors-types'
import * as repo from '../repo/index.js'

const linkGetters = {
  commits: repo.getLinkToCommits,
  issues: repo.getLinkToIssues,
  reviews: repo.getLinkToReviews,
}

const defaultTypes = function (repoType) {
  return Object.fromEntries(
    Object.entries(builtInTypes).map(([name, {link, ...type}]) => [
      name,
      link ? {...type, link: linkGetters[link](repoType)} : type,
    ]),
  )
}

export function contributionTypes(options) {
  return {...defaultTypes(options.repoType), ...options.types}
}
