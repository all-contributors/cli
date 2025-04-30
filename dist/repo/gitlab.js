"use strict";

var fetch = require('node-fetch');
var addPrivateToken = function (url, privateToken) {
  if (privateToken === void 0) {
    privateToken = '';
  }
  if (privateToken === '') return url;
  return `${url}&private_token=${privateToken}`.replace(/\?/g, '&').replace('&', '?');
};
var getUserInfo = function (username, hostname, privateToken) {
  /* eslint-disable complexity */
  if (!hostname) {
    hostname = 'https://gitlab.com';
  }
  return fetch(addPrivateToken(`${hostname}/api/v4/users?username=${username}`, privateToken), {
    headers: {
      'User-Agent': 'node-fetch'
    }
  }).then(function (res) {
    return res.json().then(function (body) {
      // Gitlab returns an array of users. If it is empty, it means the username provided does not exist
      if (!body || body.length === 0) {
        throw new Error(`User ${username} not found`);
      }

      // no private token present
      if (body.message) {
        throw new Error(body.message);
      }
      var user = body[0];
      return {
        login: user.username,
        name: user.name || username,
        avatar_url: user.avatar_url,
        profile: user.web_url.startsWith('http') ? user.web_url : `http://${user.web_url}`
      };
    });
  });
};
var getContributors = function (owner, name, hostname, privateToken) {
  if (!hostname) {
    hostname = 'https://gitlab.com';
  }
  return fetch(addPrivateToken(`${hostname}/api/v4/projects?search=${name}`, privateToken), {
    headers: {
      'User-Agent': 'node-fetch'
    }
  }).then(function (res) {
    return res.json().then(function (projects) {
      // Gitlab returns an array of users. If it is empty, it means the username provided does not exist
      if (!projects || projects.length === 0) {
        throw new Error(`Project ${owner}/${name} not found`);
      }
      var project = null;
      for (var i = 0; i < projects.length; i++) {
        if (projects[i].path_with_namespace === `${owner}/${name}`) {
          project = projects[i];
          break;
        }
      }
      if (!project) {
        throw new Error(`Project ${owner}/${name} not found`);
      }
      return fetch(addPrivateToken(`${hostname}/api/v4/projects/${project.id}/repository/contributors`, privateToken), {
        headers: {
          'User-Agent': 'node-fetch'
        }
      }).then(function (newRes) {
        if (newRes.status === 404 || newRes.status >= 500) {
          throw new Error('No contributors found on the GitLab repository');
        }
        return newRes.json().then(function (contributors) {
          if (newRes.status >= 400 || !newRes.ok) {
            throw new Error(contributors.message);
          }
          return contributors.map(function (item) {
            return item.name;
          });
        });
      });
    });
  });
};
module.exports = {
  getUserInfo,
  getContributors
};