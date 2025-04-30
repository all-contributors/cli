"use strict";

var _ = require('lodash/fp');
var formatContributionType = require('./format-contribution-type');
var avatarTemplate = _.template('<img src="<%= contributor.avatar_url %>?s=<%= options.imageSize %>" width="<%= options.imageSize %>px;" alt="<%= name %>"/>');
var avatarBlockTemplate = _.template('<a href="<%= contributor.profile %>"><%= avatar %><br /><sub><b><%= name %></b></sub></a>');
var avatarBlockTemplateNoProfile = _.template('<%= avatar %><br /><sub><b><%= name %></b></sub>');
var contributorTemplate = _.template('<%= avatarBlock %><br /><%= contributions %>');
var defaultImageSize = 100;
function defaultTemplate(templateData) {
  var rawName = templateData.contributor.name || templateData.contributor.login;
  var name = escapeName(rawName);
  var avatar = avatarTemplate(_.assign(templateData, {
    name
  }));
  var avatarBlockTemplateData = _.assign({
    name,
    avatar
  }, templateData);
  var avatarBlock = null;
  if (templateData.contributor.profile) {
    avatarBlock = avatarBlockTemplate(avatarBlockTemplateData);
  } else {
    avatarBlock = avatarBlockTemplateNoProfile(avatarBlockTemplateData);
  }
  return contributorTemplate(_.assign({
    avatarBlock
  }, templateData));
}
function escapeName(name) {
  return name.replace(new RegExp('\\|', 'g'), '&#124;').replace(new RegExp('\\"', 'g'), '&quot;');
}
module.exports = function (options, contributor) {
  var formatter = _.partial(formatContributionType, [options, contributor]);
  var contributions = contributor.contributions.map(formatter).join(' ');
  var templateData = {
    contributions,
    contributor,
    options: _.assign({
      imageSize: defaultImageSize
    }, options)
  };
  var customTemplate = options.contributorTemplate && _.template(options.contributorTemplate);
  return (customTemplate || defaultTemplate)(templateData);
};