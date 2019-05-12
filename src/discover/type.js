const defaultIdeaLabels = /feat|enhancement|idea/

const getContributorType = issue => {
  if (issue.pull_request) return 'code'

  const isIdea = issue.labels.some(({name}) => defaultIdeaLabels.test(name))

  return isIdea ? 'idea' : 'bug'
}

module.exports = getContributorType
