"use strict";

var url = require('url');
var fetch = require('node-fetch');
var _require = require('../util/url'),
  parseHttpUrl = _require.parseHttpUrl,
  isValidHttpUrl = _require.isValidHttpUrl;

/**
 * Get the host based on public or enterprise GitHub.
 * https://developer.github.com/enterprise/2.17/v3/#current-version
 *
 * @param {String} hostname - Hostname from config.
 * @returns {String} - Host for GitHub API.
 */
function getApiHost(hostname) {
  if (!hostname) {
    hostname = 'https://github.com';
  }
  if (hostname !== 'https://github.com') {
    // Assume Github Enterprise
    return url.resolve(hostname, '/api/v3');
  }
  return hostname.replace(/:\/\//, '://api.');
}
function getFetchHeaders(optionalPrivateToken) {
  if (optionalPrivateToken === void 0) {
    optionalPrivateToken = '';
  }
  var fetchHeaders = {
    'User-Agent': 'node-fetch'
  };
  if (optionalPrivateToken && optionalPrivateToken.length > 0) {
    fetchHeaders.Authorization = `token ${optionalPrivateToken}`;
  }
  return fetchHeaders;
}
function getNextLink(link) {
  if (!link) {
    return null;
  }
  var nextLink = link.split(',').find(function (s) {
    return s.includes('rel="next"');
  });
  if (!nextLink) {
    return null;
  }
  return nextLink.split(';')[0].trim().slice(1, -1);
}
function getContributorsPage(githubUrl, optionalPrivateToken) {
  return fetch(githubUrl, {
    headers: getFetchHeaders(optionalPrivateToken)
  }).then(function (res) {
    if (res.status === 404 || res.status >= 500) {
      throw new Error('No contributors found on the GitHub repository');
    }
    return res.json().then(function (body) {
      if (res.status >= 400 || !res.ok) {
        throw new Error(body.message);
      }
      var contributorsIds = body.map(function (contributor) {
        return contributor.login;
      });
      var nextLink = getNextLink(res.headers.get('link'));
      if (nextLink) {
        return getContributorsPage(nextLink, optionalPrivateToken).then(function (nextContributors) {
          return contributorsIds.concat(nextContributors);
        });
      }
      return contributorsIds;
    });
  });
}
var getUserInfo = function (username, hostname, optionalPrivateToken) {
  if (!username) {
    throw new Error(`No login when adding a contributor. Please specify a username.`);
  }
  var root = getApiHost(hostname);
  return fetch(`${root}/users/${username}`, {
    headers: getFetchHeaders(optionalPrivateToken)
  }).then(function (res) {
    return res.json().then(function (body) {
      var profile = isValidHttpUrl(body.blog) ? body.blog : body.html_url;

      // Check for authentication required
      if (!profile && body.message.includes('Must authenticate') || res.status === 401) {
        throw new Error(`Missing authentication for GitHub API. Did you set PRIVATE_TOKEN?`);
      }

      // Github throwing specific errors as 200...
      if (!profile && body.message) {
        if (body.message.toLowerCase().includes('api rate limit exceeded')) {
          throw new Error(body.message);
        } else {
          throw new Error(`The username ${username} doesn't exist on GitHub.`);
        }
      }
      profile = parseHttpUrl(profile);
      return {
        login: body.login,
        name: body.name || username,
        avatar_url: body.avatar_url,
        profile
      };
    });
  });
};
var getContributors = function (owner, name, hostname, optionalPrivateToken) {
  var root = getApiHost(hostname);
  return getContributorsPage(`${root}/repos/${owner}/${name}/contributors?per_page=100`, optionalPrivateToken);
};
module.exports = {
  getUserInfo,
  getContributors
};