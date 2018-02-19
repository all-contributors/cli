const pify = require('pify')
const request = pify(require('request'))

module.exports = {
	getUserInfo: function(username, hostname) {
	  /* eslint-disable complexity */
		if (!hostname) {
			hostname = 'https://gitlab.com';
		}

	  return request
	    .get({
	      url: `${hostname}/api/v4/users?username=${username}`,
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
	        profile: user.web_url.startsWith('http') ? user.web_url : `http://${user.web_url}`,
	      }
	    })
	},

	getContributors: function(owner, name, hostname) {
		if (!hostname) {
			hostname = 'https://gitlab.com';
		}

		return request
	    .get({
	      url: `${hostname}/api/v4/projects?search=${name}`,
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
						break;
					}
				}

				if (!project) {
	        throw new Error(`Project ${owner}/${name} not found`)
	      }

				return request
			    .get({
			      url: `${hostname}/api/v4/projects/${project.id}/repository/contributors`,
			      headers: {
			        'User-Agent': 'request',
			      },
			    })
			    .then(newRes => {
			      const contributors = JSON.parse(newRes.body)

			      return contributors.map(item => item.email)
			    })
	    })
	}
}
