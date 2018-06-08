const url = require('url')
const pify = require('pify')
const request = pify(require('request'))

function getApiHost(hostname, isEnterprise) {
  return isEnterprise
    ? url.resolve(hostname, '/api/v3')
    : hostname.replace(/:\/\//, '://api.')
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

function getContributorsPage(githubUrl) {
  return request
    .get({
      url: githubUrl,
      headers: {
        'User-Agent': 'request',
      },
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

const getUserInfo = function(username, hostname, isEnterprise) {
  /* eslint-disable complexity */
  if (!hostname) {
    hostname = 'https://github.com'
  }

  const root = getApiHost(hostname, isEnterprise)
  return request
    .get({
      url: `${root}/users/${username}`,
      headers: {
        'User-Agent': 'request',
      },
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

const getContributors = function(owner, name, hostname, isEnterprise) {
  if (!hostname) {
    hostname = 'https://github.com'
  }

  const root = getApiHost(hostname, isEnterprise)
  const githubUrl = `${root}/repos/${owner}/${name}/contributors?per_page=100`

  return getContributorsPage(githubUrl)
}

module.exports = {
  getUserInfo,
  getContributors,
}
