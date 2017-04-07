'use strict';

var _ = require('lodash/fp');
var formatContributionType = require('./format-contribution-type');

var avatarTemplate = _.template('<img src="<%= contributor.avatar_url %>" width="<%= options.imageSize %>px;"/>');
var avatarBlockTemplate = _.template('[<%= avatar %><br /><sub><%= name %></sub>](<%= contributor.profile %>)');
var contributorTemplate = _.template('<%= avatarBlock %><br /><%= contributions %>');

var defaultImageSize = 100;

function defaultTemplate(templateData) {
  var avatar = avatarTemplate(templateData);
  var avatarBlock = avatarBlockTemplate(_.assign({
    name: escapeName(templateData.contributor.name),
    avatar: avatar
  }, templateData));

  return contributorTemplate(_.assign({avatarBlock: avatarBlock}, templateData));
}

function escapeName(name) {
  return name.replace(new RegExp('\\|', 'g'), '&#124;');
}

module.exports = function formatContributor(options, contributor) {
  var formatter = _.partial(formatContributionType, [options, contributor]);
  var contributions = contributor.contributions
    .map(formatter)
    .join(' ');
  var templateData = {
    contributions: contributions,
    contributor: contributor,
    options: _.assign({imageSize: defaultImageSize}, options)
  };
  var customTemplate = options.contributorTemplate && _.template(options.contributorTemplate);
  return (customTemplate || defaultTemplate)(templateData);
};
