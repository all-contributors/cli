const addContributor = require('./add')

// Adds a contributor without going to the network (you supply the additional fields)
module.exports = function addContributorWithDetails({
  options,
  login,
  contributions,
  name,
  avatar_url,
  profile,
}) {
  const infoFetcherNoNetwork = function() {
    return Promise.resolve({
      login,
      name,
      avatar_url,
      profile,
    })
  }
  return addContributor(options, login, contributions, infoFetcherNoNetwork)
}
