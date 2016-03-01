'use strict';

var _ = require('lodash/fp');

var formatContributionType = require('./formatContributionType');

var avatarTemplate = _.template('![<%= contributor.name %>](<%= contributor.avatar_url %>)');
var avatarBlockTemplate = _.template('[<%= avatar %><br /><sub><%= contributor.name %></sub>](<%= contributor.html_url %>)');
var contributorTemplate = _.template('<%= avatarBlock %><br /><%= contributions %>');

function defaultTemplate(templateData) {
  var avatar = avatarTemplate(templateData);
  var avatarBlock = avatarBlockTemplate(_.assign({ avatar: avatar }, templateData));
  return contributorTemplate(_.assign({ avatarBlock: avatarBlock }, templateData));
}

function updateAvatarUrl(options, contributor) {
  var avatarUrl = contributor.avatar_url;
  var paramJoiner = _.includes('?', avatarUrl) ? '&' : '?';
  return _.assign(contributor, {
    avatar_url: avatarUrl + paramJoiner + 's=' + options.imageSize
  });
  '<%= contributor.avatar_url %>?s=<%= options.imageSize %>'
}

module.exports = function formatContributor(options, contributor) {
  var contributions = contributor.contributions.map(
    _.partial(formatContributionType, [options, contributor])
  ).join(' ');

  var templateData = {
    contributions: contributions,
    contributor: updateAvatarUrl(options, contributor),
    options: options
  };

  var customTemplate = options.template && _.template(options.template);
  return (customTemplate || defaultTemplate)(templateData);
};
