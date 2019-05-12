const Octokit = require('@octokit/rest').plugin(
  require('@octokit/plugin-retry'),
)

const getContributorType = require('./type')

const getContributors = function(owner, repo, hostname, optionalPrivateToken) {
  if (!hostname) {
    hostname = 'https://github.com'
  }

  const options = {
    baseUrl: hostname.replace(/:\/\//, '://api.'),
    auth: optionalPrivateToken,
  }

  const octokit = new Octokit(options)

  return octokit
    .paginate(
      octokit.issues.listForRepo.endpoint.merge({
        owner,
        repo,
        state: 'all',
      }),
    )
    .then(issues => {
      const allContributors = issues.reduce((contributors, issue) => {
        const {login} = issue.user
        const type = getContributorType(issue)

        if (!contributors[login]) contributors[login] = {types: new Set()}

        contributors[login].types.add(type)
        return contributors
      }, {})

      // return only unique values
      return Object.keys(allContributors).map(key => {
        const {types} = allContributors[key]
        // types is a Set that contains unique types
        return {login: key, types: [...types]}
      })
    })
}

module.exports = {
  getContributors,
}
