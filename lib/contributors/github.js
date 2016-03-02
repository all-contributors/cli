'use strict';

var _ = require('lodash/fp');
var request = require('request');

module.exports = function getUserInfo(username, cb) {
  request.get({
    url: 'https://api.github.com/users/' + username,
    headers: {
      'User-Agent': 'request'
    }
  }, function(error, res) {
    if (error) {
      return cb(error);
    }
    var user = JSON.parse(res.body);
    return cb(null, _.pick(['login', 'name', 'avatar_url', 'html_url'], user));
  });
}
