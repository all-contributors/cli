const nyc = require('name-your-contributors')
const {Spinner} = require('clui')

const privateToken = (process.env && process.env.PRIVATE_TOKEN) || ''
const loader = new Spinner('Loading...')

const getContributors = function(owner, name, token = privateToken) {
  loader.start()
  const contributors = nyc.repoContributors({
    token,
    user: owner,
    repo: name,
    commits: true,
  })
  loader.stop()
  return contributors
}

module.exports = {getContributors}
