const pify = require('pify')
const request = pify(require('request'))

const addPrivateToken = (url, privateToken = '') => {
  if (privateToken === '') return url
  return `${url}&private_token=${privateToken}`
    .replace(/\?/g, '&')
    .replace('&', '?')
}

const getUserInfo = function(username, hostname, privateToken = '') {
  /* eslint-disable complexity */
  if (!hostname) {
    hostname = 'https://gitlab.com'
  }

  return request
    .get({
      url: addPrivateToken(
        `${hostname}/api/v4/users?username=${username}`,
        privateToken,
      ),
      headers: {
        'User-Agent': 'request',
      },
    })
    .then(res => {
      const body = JSON.parse(res.body)

      // Gitlab returns an array of users. If it is empty, it means the username provided does not exist
      if (!body || body.length === 0) {
        throw new Error(`User ${username} not found`)
      }

      const user = body[0]

      return {
        login: user.username,
        name: user.name || username,
        avatar_url: user.avatar_url,
        profile: user.web_url.startsWith('http')
          ? user.web_url
          : `http://${user.web_url}`,
      }
    })
}

const getContributors = function(owner, name, hostname, privateToken = '') {
  if (!hostname) {
    hostname = 'https://gitlab.com'
  }

  return request
    .get({
      url: addPrivateToken(
        `${hostname}/api/v4/projects?search=${name}`,
        privateToken,
      ),
      headers: {
        'User-Agent': 'request',
      },
    })
    .then(res => {
      const projects = JSON.parse(res.body)

      // Gitlab returns an array of users. If it is empty, it means the username provided does not exist
      if (!projects || projects.length === 0) {
        throw new Error(`Project ${owner}/${name} not found`)
      }

      let project = null
      for (let i = 0; i < projects.length; i++) {
        if (projects[i].path_with_namespace === `${owner}/${name}`) {
          project = projects[i]
          break
        }
      }

      if (!project) {
        throw new Error(`Project ${owner}/${name} not found`)
      }

      return request
        .get({
          url: addPrivateToken(
            `${hostname}/api/v4/projects/${project.id}/repository/contributors`,
            privateToken,
          ),
          headers: {
            'User-Agent': 'request',
          },
        })
        .then(newRes => {
          const contributors = JSON.parse(newRes.body)
          if (newRes.statusCode >= 400) {
            if (newRes.statusCode === 404) {
              throw new Error('No contributors found on the GitLab repository')
            }
            throw new Error(contributors.message)
          }
          return contributors.map(item => item.name)
        })
    })
}

module.exports = {
  getUserInfo,
  getContributors,
}
