'use strict';

var template = require('lodash.template');
var findIndex = require('lodash.findindex');

function listAllContributors(start, lines) {
  var i = 0;
  while (start + i < lines.length && lines[start + i].indexOf('[![') === 0) {
    i++;
  }
  return lines.slice(start, start + i);
}

var defaultTemplate =
  '[![<%= user.name %>](<%= user.avatar_url %>&s=<%= options.imageSize %>)' +
  '<br /><%= user.name %>](<%= user.html_url %>)' +
  ' | [<%= contributions %>](https://github.com/<%= options.projectOwner %>/<%= options.projectName %>/commits?author=<%= user.login %>)';

function contributorEntry(options, user) {
  var contributions = options.contributions
    .map(function(contribution) {
      return options.emoji[contribution];
    })
    .join('');

  var contributionTemplate = template(options.template || defaultTemplate);

  return contributionTemplate({
    user: user,
    contributions: contributions,
    options: options
  });
}

module.exports = function addContributor(options, user, fileContent) {
  var contributor = contributorEntry(options, user);

  var lines = fileContent.split('\n');
  var contributorListStart = findIndex(lines, function(line) {
    return line.indexOf(':---: | :---:') !== -1;
  });
  var contributors = [].concat(
    listAllContributors(contributorListStart + 1, lines),
    contributor
  );

  return [].concat(
    lines.slice(0, contributorListStart + 1),
    contributors,
    lines.slice(contributorListStart + contributors.length)
  ).join('\n')
}
