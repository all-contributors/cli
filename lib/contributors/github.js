'use strict';

var pify = require('pify');
var request = pify(require('request'));

module.exports = function getUserInfo(username) {
  return request.get({
    url: 'https://api.github.com/users/' + username,
    headers: {
      'User-Agent': 'request'
    }
  })
  .then(res => {
    var body = JSON.parse(res.body);
    var profile = body.blog || body.html_url;

    // Github throwing specific errors as 200...
    if (!profile && body.message) {
      throw new Error(body.message);
    }

    profile = profile.startsWith('http') ? profile : 'http://' + profile;

    return {
      login: body.login,
      name: body.name || username,
      avatar_url: body.avatar_url,
      profile
    };
  });
};
