'use strict';

var pify = require('pify');
var request = pify(require('request'));

module.exports = function getContributorsFromGithub(repository) {
  return request.get({
    url: 'https://api.github.com/repos/' + repository + '/contributors?per_page=100',
    headers: {
      'User-Agent': 'request'
    }
  })
  .then(res => {
    var body = JSON.parse(res.body);
    return body.map(contributor => contributor.login);
  });
};
