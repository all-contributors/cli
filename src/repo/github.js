import url from 'url'
import {parseHttpUrl, isValidHttpUrl} from '../util/url.js'

/**
 * Get the host based on public or enterprise GitHub.
 * https://developer.github.com/enterprise/2.17/v3/#current-version
 *
 * @param {String} hostname - Hostname from config.
 * @returns {String} - Host for GitHub API.
 */
export function getApiHost(hostname) {
  if (!hostname) {
    hostname = 'https://github.com'
  }

  const cleanHostname = hostname.trim().replace(/\/+$/, '')

  if (
    cleanHostname === 'https://github.com' ||
    cleanHostname === 'http://github.com' ||
    cleanHostname === 'https://api.github.com' ||
    cleanHostname === 'http://api.github.com'
  ) {
    return 'https://api.github.com'
  }

  if (cleanHostname.endsWith('/api/v3')) {
    return cleanHostname
  }

  // Assume Github Enterprise
  return url.resolve(cleanHostname, '/api/v3')
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

  return nextLink.split(';')[0].trim().slice(1, -1)
}

function getContributorsPage(githubUrl, optionalPrivateToken) {
  return fetch(githubUrl, {
    headers: getFetchHeaders(optionalPrivateToken),
  }).then(async res => {
    if (res.status === 404 || res.status >= 500) {
      throw new Error('No contributors found on the GitHub repository')
    }

    let body
    try {
      body = await res.json()
    } catch {
      throw new Error('No contributors found on the GitHub repository')
    }

    if (res.status >= 400 || !res.ok) {
      throw new Error(body.message || 'Error fetching contributors from GitHub')
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
}

export const getUserInfo = function (username, hostname, optionalPrivateToken) {
  if (!username) {
    throw new Error(
      `No login when adding a contributor. Please specify a username.`,
    )
  }

  const root = getApiHost(hostname)
  return fetch(`${root}/users/${username}`, {
    headers: getFetchHeaders(optionalPrivateToken),
  }).then(async res => {
    let body
    try {
      body = await res.json()
    } catch {
      if (res.status === 404) {
        throw new Error(`The username ${username} doesn't exist on GitHub.`)
      }
      if (res.status === 401) {
        throw new Error(
          `Missing authentication for GitHub API. Did you set PRIVATE_TOKEN?`,
        )
      }
      throw new Error(
        `Failed to fetch user info for ${username} from ${root}/users/${username} (Status: ${res.status})`,
      )
    }

    let profile = isValidHttpUrl(body.blog) ? body.blog : body.html_url

    // Check for authentication required
    if (
      (!profile &&
        body.message &&
        body.message.includes('Must authenticate')) ||
      res.status === 401
    ) {
      throw new Error(
        `Missing authentication for GitHub API. Did you set PRIVATE_TOKEN?`,
      )
    }

    if (res.status === 404) {
      throw new Error(`The username ${username} doesn't exist on GitHub.`)
    }

    // Github throwing specific errors as 200...
    if (!profile && body.message) {
      if (body.message.toLowerCase().includes('api rate limit exceeded')) {
        throw new Error(body.message)
      } else {
        throw new Error(`The username ${username} doesn't exist on GitHub.`)
      }
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

export const getContributors = function (
  owner,
  name,
  hostname,
  optionalPrivateToken,
) {
  const root = getApiHost(hostname)
  const contributorsUrl = `${root}/repos/${owner}/${name}/contributors?per_page=100`
  return getContributorsPage(contributorsUrl, optionalPrivateToken)
}
