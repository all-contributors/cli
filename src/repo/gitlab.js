import fetch from 'node-fetch'

const addPrivateToken = (url, privateToken = '') => {
  if (privateToken === '') return url

  return `${url}&private_token=${privateToken}`
    .replace(/\?/g, '&')
    .replace('&', '?')
}

const getUserInfo = function (username, hostname, privateToken) {
  if (!hostname) {
    hostname = 'https://gitlab.com'
  }

  return fetch(
    addPrivateToken(
      `${hostname}/api/v4/users?username=${username}`,
      privateToken,
    ),
    {
      headers: {
        'User-Agent': 'node-fetch',
      },
    },
  ).then(res =>
    res.json().then(body => {
      // Gitlab returns an array of users. If it is empty, it means the username provided does not exist
      if (!body || body.length === 0) {
        throw new Error(`User ${username} not found`)
      }

      // no private token present
      if (body.message) {
        throw new Error(body.message)
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
    }),
  )
}

const getContributors = function (owner, name, hostname, privateToken) {
  if (!hostname) {
    hostname = 'https://gitlab.com'
  }

  return fetch(
    addPrivateToken(`${hostname}/api/v4/projects?search=${name}`, privateToken),
    {headers: {'User-Agent': 'node-fetch'}},
  ).then(res =>
    res.json().then(projects => {
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

      return fetch(
        addPrivateToken(
          `${hostname}/api/v4/projects/${project.id}/repository/contributors`,
          privateToken,
        ),
        {headers: {'User-Agent': 'node-fetch'}},
      ).then(newRes => {
        if (newRes.status === 404 || newRes.status >= 500) {
          throw new Error('No contributors found on the GitLab repository')
        }
        return newRes.json().then(contributors => {
          if (newRes.status >= 400 || !newRes.ok) {
            throw new Error(contributors.message)
          }
          return contributors.map(item => item.name)
        })
      })
    }),
  )
}

export {getUserInfo, getContributors}
