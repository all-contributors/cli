'use strict';

var pify = require('pify');
var request = pify(require('request'));

function getNextLink(link) {
  if (!link) {
    return null;
  }

  var nextLink = link.split(',').find(s => s.indexOf('rel="next"') > -1);

  if (!nextLink) {
    return null;
  }

  return nextLink.split(';')[0].slice(1, -1);
}

function getContributorsPage(url) {
  return request.get({
    url: url,
    headers: {
      'User-Agent': 'request'
    }
  })
  .then(res => {
    var body = JSON.parse(res.body);
    var contributorsIds = body.map(contributor => contributor.login);

    var nextLink = getNextLink(res.headers.link);
    if (nextLink) {
      return getContributorsPage(nextLink).then(nextContributors => {
        return contributorsIds.concat(nextContributors);
      })
    }

    return contributorsIds;
  });
}

module.exports = function getContributorsFromGithub(owner, name) {
  var url = 'https://api.github.com/repos/' + owner + '/' + name + '/contributors?per_page=100';
  return getContributorsPage(url);
};
