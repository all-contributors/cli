'use strict';

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
    return cb(null, JSON.parse(res.body));
  });
}
