const url = require('url')
const pify = require('pify')
const request = pify(require('request'))
const { parseHttpUrl, isValidHttpUrl } = require('../util/url')

/**
 * Get the host based on public or enterprise GitHub.
 * https://developer.github.com/enterprise/2.17/v3/#current-version
 *
 * @param {String} hostname - Hostname from config.
 * @returns {String} - Host for GitHub API.
 */
function getApiHost(hostname) {
  if (!hostname) {
    hostname = 'https://github.com'
  }

  if (hostname !== 'https://github.com') {
    // Assume Github Enterprise
    return url.resolve(hostname, '/api/v3')
  }

  return hostname.replace(/:\/\//, '://api.')
}

function getRequestHeaders(optionalPrivateToken = '') {
  const requestHeaders = {
    'User-Agent': 'request',
  }

  if (optionalPrivateToken && optionalPrivateToken.length > 0) {
    requestHeaders.Authorization = `token ${optionalPrivateToken}`
  }

  return requestHeaders
}

function getNextLink(link) {
  if (!link) {
    return null
  }

  const nextLink = link.split(',').find(s => s.includes('rel="next"'))

  if (!nextLink) {
    return null
  }

  return nextLink.split(';')[0].slice(1, -1)
}

function getContributorsPage(githubUrl, optionalPrivateToken) {
  return request
    .get({
      url: githubUrl,
      headers: getRequestHeaders(optionalPrivateToken),
    })
    .then(res => {
      const body = JSON.parse(res.body)
      if (res.statusCode >= 400) {
        if (res.statusCode === 404) {
          throw new Error('No contributors found on the GitHub repository')
        }
        throw new Error(body.message)
      }
      const contributorsIds = body.map(contributor => contributor.login)

      const nextLink = getNextLink(res.headers.link)
      if (nextLink) {
        return getContributorsPage(nextLink, optionalPrivateToken).then(
          nextContributors => {
            return contributorsIds.concat(nextContributors)
          },
        )
      }

      return contributorsIds
    })
}

const getUserInfo = function(username, hostname, optionalPrivateToken) {
  if (!username) {
    throw new Error(
      `No login when adding a contributor. Please specify a username.`,
    )
  }

  const root = getApiHost(hostname)
  return request
    .get({
      url: `${root}/users/${username}`,
      headers: getRequestHeaders(optionalPrivateToken),
    })
    .then(res => {
      const body = JSON.parse(res.body)

      let profile = isValidHttpUrl(body.blog) ? body.blog : body.html_url

      // Check for authentication required
      if (
        (!profile && body.message.includes('Must authenticate')) ||
        res.statusCode === 401
      ) {
        throw new Error(
          `Missing authentication for GitHub API. Did you set PRIVATE_TOKEN?`,
        )
      }

      // Github throwing specific errors as 200...
      if (!profile && body.message) {
        throw new Error(
          `Login not found when adding a contributor for username - ${username}.`,
        )
      }

      profile = parseHttpUrl(profile)

      return {
        login: body.login,
        name: body.name || username,
        avatar_url: body.avatar_url,
        profile,
      }
    })
}

const getContributors = function(owner, name, hostname, optionalPrivateToken) {
  const root = getApiHost(hostname)
  const contributorsUrl = `${root}/repos/${owner}/${name}/contributors?per_page=100`
  return getContributorsPage(contributorsUrl, optionalPrivateToken)
}

module.exports = {
  getUserInfo,
  getContributors,
}
