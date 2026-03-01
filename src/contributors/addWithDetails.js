import {add} from './add.js'

// Adds a contributor without going to the network (you supply the additional fields)
export function addContributorWithDetails({
  options,
  login,
  contributions,
  name,
  avatar_url,
  profile,
}) {
  const infoFetcherNoNetwork = function () {
    return Promise.resolve({
      login,
      name,
      avatar_url,
      profile,
    })
  }
  return add(options, login, contributions, infoFetcherNoNetwork)
}
