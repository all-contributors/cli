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

const getUserInfo = function(username, hostname) {
	/* eslint-disable complexity */
	if (!hostname) {
		hostname = 'https://github.com';
	}

	const root = hostname.replace(/:\/\//, '://api.')
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

const getContributors = function(owner, name, hostname) {
	if (!hostname) {
		hostname = 'https://github.com';
	}

	const root = hostname.replace(/:\/\//, '://api.')
	const url = `${root}/repos/${owner}/${name}/contributors?per_page=100`
	return getContributorsPage(url)
}

module.exports = {
	getUserInfo,
	getContributors
}
