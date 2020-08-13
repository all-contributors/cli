const url = require('url')
const fetch = require('node-fetch')
const {parseHttpUrl, isValidHttpUrl} = require('../util/url')

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

function getFetchHeaders(optionalPrivateToken = '') {
  const fetchHeaders = {
    'User-Agent': 'node-fetch',
  }

  if (optionalPrivateToken && optionalPrivateToken.length > 0) {
    fetchHeaders.Authorization = `token ${optionalPrivateToken}`
  }

  return fetchHeaders
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
  return fetch(githubUrl, {
    headers: getFetchHeaders(optionalPrivateToken),
  }).then(res => {
    if (res.status === 404 || res.status >= 500) {
      throw new Error('No contributors found on the GitLab repository')
    }

    return res.json().then(body => {
      if (res.status >= 400 || !res.ok) {
        throw new Error(body.message)
      }
      const contributorsIds = body.map(contributor => contributor.login)

      const nextLink = getNextLink(res.headers.get('link'))
      if (nextLink) {
        return getContributorsPage(nextLink, optionalPrivateToken).then(
          nextContributors => {
            return contributorsIds.concat(nextContributors)
          },
        )
      }

      return contributorsIds
    })
  })
}

const getUserInfo = function (username, hostname, optionalPrivateToken) {
  if (!username) {
    throw new Error(
      `No login when adding a contributor. Please specify a username.`,
    )
  }

  const root = getApiHost(hostname)
  return fetch(`${root}/users/${username}`, {
    headers: getFetchHeaders(optionalPrivateToken),
  }).then(res =>
    res.json().then(body => {
      let profile = isValidHttpUrl(body.blog) ? body.blog : body.html_url

      // Check for authentication required
      if (
        (!profile && body.message.includes('Must authenticate')) ||
        res.status === 401
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
    }),
  )
}

const getContributors = function (owner, name, hostname, optionalPrivateToken) {
  const root = getApiHost(hostname)
  const contributorsUrl = `${root}/repos/${owner}/${name}/contributors?per_page=100`
  return getContributorsPage(contributorsUrl, optionalPrivateToken)
}

module.exports = {
  getUserInfo,
  getContributors,
}
