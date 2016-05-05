'use strict';

var _ = require('lodash/fp');
var formatContributionType = require('./format-contribution-type');

var avatarTemplate = _.template('![<%= contributor.name %>](<%= contributor.avatar_url %>)');
var avatarBlockTemplate = _.template('[<%= avatar %><br /><sub><%= contributor.name %></sub>](<%= contributor.profile %>)');
var contributorTemplate = _.template('<%= avatarBlock %><br /><%= contributions %>');

var defaultImageSize = 100;

function defaultTemplate(templateData) {
  var avatar = avatarTemplate(templateData);
  var avatarBlock = avatarBlockTemplate(_.assign({avatar: avatar}, templateData));
  return contributorTemplate(_.assign({avatarBlock: avatarBlock}, templateData));
}

function updateAvatarUrl(options, contributor) {
  var avatarUrl = contributor.avatar_url;
  var paramJoiner = _.includes('?', avatarUrl) ? '&' : '?';
  var imageSize = options.imageSize || defaultImageSize;
  return _.assign(contributor, {
    avatar_url: avatarUrl + paramJoiner + 's=' + imageSize
  });
}

module.exports = function formatContributor(options, contributor) {
  var formatter = _.partial(formatContributionType, [options, contributor]);
  var contributions = contributor.contributions
    .map(formatter)
    .join(' ');
  var templateData = {
    contributions: contributions,
    contributor: updateAvatarUrl(options, contributor),
    options: options
  };
  var customTemplate = options.contributorTemplate && _.template(options.contributorTemplate);
  return (customTemplate || defaultTemplate)(templateData);
};
