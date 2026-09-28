import {parseHttpUrl, isValidHttpUrl} from '../util/url.js'

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

function getCommitsPage(url, optionalPrivateToken) {
  return fetch(url, {
    headers: getFetchHeaders(optionalPrivateToken),
  }).then(res => {
    if (res.status === 404 || res.status >= 500) {
      throw new Error('No contributors found on the repository')
    }

    return res.json().then(body => {
      if (res.status >= 400 || !res.ok) {
        throw new Error(body.message || 'Failed to fetch commits')
      }

      if (!Array.isArray(body)) {
        return []
      }

      const commitLogins = body
        .map(item => {
          if (item.author && item.author.login) {
            return item.author.login
          }
          if (item.commit && item.commit.author && item.commit.author.name) {
            return item.commit.author.name
          }
          return null
        })
        .filter(Boolean)

      const nextLink = getNextLink(res.headers.get('link'))
      if (nextLink) {
        return getCommitsPage(nextLink, optionalPrivateToken).then(
          nextLogins => {
            return commitLogins.concat(nextLogins)
          },
        )
      }

      return commitLogins
    })
  })
}

export const getUserInfo = async function (
  username,
  hostname,
  optionalPrivateToken,
) {
  if (!username) {
    throw new Error(
      `No login when adding a contributor. Please specify a username.`,
    )
  }

  const baseHost = (hostname || 'https://codeberg.org').replace(/\/$/, '')
  return fetch(`${baseHost}/api/v1/users/${username}`, {
    headers: getFetchHeaders(optionalPrivateToken),
  }).then(res =>
    res.json().then(body => {
      if (res.status === 401) {
        throw new Error(
          `Missing authentication for API. Did you set PRIVATE_TOKEN?`,
        )
      }

      if (res.status === 404 || !res.ok) {
        throw new Error(
          `The username ${username} doesn't exist on ${baseHost}.`,
        )
      }

      let profile = isValidHttpUrl(body.website) ? body.website : body.html_url

      if (!profile) {
        profile = `${baseHost}/${username}`
      }

      profile = parseHttpUrl(profile)

      return {
        login: body.login || username,
        name: body.full_name || body.login || username,
        avatar_url: body.avatar_url,
        profile,
      }
    }),
  )
}

export const getContributors = function (
  owner,
  name,
  hostname,
  optionalPrivateToken,
) {
  const baseHost = (hostname || 'https://codeberg.org').replace(/\/$/, '')
  const commitsUrl = `${baseHost}/api/v1/repos/${owner}/${name}/commits?limit=100`

  return getCommitsPage(commitsUrl, optionalPrivateToken).then(logins => {
    return [...new Set(logins)]
  })
}
