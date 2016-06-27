'use strict';

var request = require('request');

module.exports = function getUserInfo(username, cb) {
  request.get({
    url: 'https://api.github.com/users/' + username,
    headers: {
      'User-Agent': 'request'
    }
  }, function (error, res) {
    if (error) {
      return cb(error);
    }
    var body = JSON.parse(res.body);
    var user = {
      login: body.login,
      name: body.name === null ? username : body.name,
      avatar_url: body.avatar_url,
      profile: body.blog || body.html_url
    };
    return cb(null, user);
  });
};
