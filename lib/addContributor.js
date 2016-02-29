'use strict';

var uniq = require('lodash.uniq');
var values = require('lodash.values');
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

function contributorEntry(options, user, existingContributions) {
  var contributions = uniq((existingContributions || []).concat(
      options.contributions
        .map(function(contribution) {
          return options.emoji[contribution];
        })
    )).join('');

  var contributionTemplate = template(options.template || defaultTemplate);

  return contributionTemplate({
    user: user,
    contributions: contributions,
    options: options
  });
}

function parseContributionTypes(options, line) {
  return values(options.emoji)
    .filter(function findExistingContribution(type) {
      return line.indexOf(type) !== -1;
    });
}

function upsertContributor(options, user, existingContributors) {
  var contributor = contributorEntry(options, user);
  var existingContributorIndex = findIndex(existingContributors, function(cont) {
    return cont.indexOf(user.login) !== 1 && cont.indexOf(user.name) !== -1;
  });

  if (existingContributorIndex === -1) {
    return [].concat(existingContributors, contributor);
  }

  var contributionTypes = parseContributionTypes(options, existingContributors[existingContributorIndex]);
  return [].concat(
    existingContributors.slice(0, existingContributorIndex),
    contributorEntry(options, user, contributionTypes),
    existingContributors.slice(existingContributorIndex + 1)
  ).join('\n')
}

module.exports = function addContributor(options, user, fileContent) {
  var lines = fileContent.split('\n');
  var contributorListStart = findIndex(lines, function(line) {
    return line.indexOf(':---: | :---:') !== -1;
  });

  var existingContributors = listAllContributors(contributorListStart + 1, lines);
  var contributors = upsertContributor(options, user, existingContributors);

  return [].concat(
    lines.slice(0, contributorListStart + 1),
    contributors,
    lines.slice(contributorListStart + existingContributors.length + 1)
  ).join('\n')
}
