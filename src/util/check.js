const pify = require('pify')
const request = pify(require('request'))

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

function getContributorsPage(url) {
  return request
    .get({
      url,
      headers: {
        'User-Agent': 'request',
      },
    })
    .then(res => {
      const body = JSON.parse(res.body)
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

module.exports = function getContributorsFromGithub(owner, name) {
  const url = `https://api.github.com/repos/${owner}/${
    name
  }/contributors?per_page=100`
  return getContributorsPage(url)
}
