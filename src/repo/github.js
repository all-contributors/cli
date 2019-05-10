const pify = require('pify')
const request = pify(require('request'))

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

function getContributorsPage(url, optionalPrivateToken) {
  return request
    .get({
      url,
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
        return getContributorsPage(nextLink).then(nextContributors => {
          return contributorsIds.concat(nextContributors)
        })
      }

      return contributorsIds
    })
}

function getIssueContributorsPage(url, optionalPrivateToken) {
  return request
    .get({
      url,
      headers: getRequestHeaders(optionalPrivateToken),
    })
    .then(res => {
      const body = JSON.parse(res.body)
      if (res.statusCode >= 300) {
        throw new Error(body.message)
      }

      const contributorsIds = []
      for (const issue of body) {
        if (!issue.pull_request) {
          contributorsIds.push(issue.user.login)
        }
      }

      const nextLink = getNextLink(res.headers.link)
      if (nextLink) {
        return getIssueContributorsPage(nextLink).then(nextContributors => {
          return contributorsIds.concat(nextContributors)
        })
      }

      return contributorsIds
    })
}

const getUserInfo = function(username, hostname, optionalPrivateToken) {
  /* eslint-disable complexity */
  if (!hostname) {
    hostname = 'https://github.com'
  }

  const root = hostname.replace(/:\/\//, '://api.')
  return request
    .get({
      url: `${root}/users/${username}`,
      headers: getRequestHeaders(optionalPrivateToken),
    })
    .then(res => {
      const body = JSON.parse(res.body)
      let profile = body.blog || body.html_url

      // Github throwing specific errors as 200...
      if (!profile && body.message) {
        throw new Error(body.message)
      }

      profile = profile.startsWith('http') ? profile : `http://${profile}`

      return {
        login: body.login,
        name: body.name || username,
        avatar_url: body.avatar_url,
        profile,
      }
    })
}

const getContributors = function(owner, name, hostname, optionalPrivateToken) {
  if (!hostname) {
    hostname = 'https://github.com'
  }

  const root = hostname.replace(/:\/\//, '://api.')
  const url = `${root}/repos/${owner}/${name}/contributors?per_page=100`
  return getContributorsPage(url, optionalPrivateToken)
}

const getBugContributors = function(
  owner,
  name,
  hostname,
  optionalPrivateToken,
) {
  if (!hostname) {
    hostname = 'https://github.com'
  }

  const root = hostname.replace(/:\/\//, '://api.')
  // GET /repos/:owner/:repo/issues
  const url = `${root}/repos/${owner}/${name}/issues`

  return getIssueContributorsPage(url, optionalPrivateToken)
}

module.exports = {
  getUserInfo,
  getContributors,
  getBugContributors,
}
