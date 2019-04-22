const nyc = require('name-your-contributors')

const privateToken = (process.env && process.env.PRIVATE_TOKEN) || ''

const getContributors = function(owner, name, token = privateToken) {
  return nyc.repoContributors({
    token,
    user: owner,
    repo: name,
    commits: true,
  })
}

module.exports = {getContributors}
