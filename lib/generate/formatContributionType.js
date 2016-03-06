'use strict';

var _ = require('lodash/fp');

var linkToCommits = 'https://github.com/<%= options.projectOwner %>/<%= options.projectName %>/commits?author=<%= contributor.login %>';
var linkToIssues = 'https://github.com/<%= options.projectOwner %>/<%= options.projectName %>/issues?q=author%3A<%= contributor.login %>';
var linkTemplate = _.template('[<%= symbol %>](<%= url %>)');

var defaultTypes = {
  blog: {symbol: '📝'},
  bug: {
    symbol: '🐛',
    link: linkToIssues
  },
  code: {
    symbol: '💻',
    link: linkToCommits
  },
  design: {symbol: '🎨'},
  doc: {
    symbol: '📖',
    link: linkToCommits
  },
  example: {symbol: '💡'},
  plugin: {symbol: '🔌'},
  question: {symbol: '❓'},
  review: {symbol: '👀'},
  talk: {symbol: '📢'},
  test: {
    symbol: '⚠️',
    link: linkToCommits
  },
  translation: {symbol: '🌍'},
  tool: {symbol: '🔧'},
  tutorial: {symbol: '✅'},
  video: {symbol: '📹'}
};

function getType(options, contribution) {
  var types = _.assign(defaultTypes, options.types);
  return types[contribution.type || contribution];
}

module.exports = function formatContribution(options, contributor, contribution) {
  var type = getType(options, contribution);
  var templateData = {
    symbol: type.symbol,
    contributor: contributor,
    options: options
  };
  if (contribution.url) {
    return linkTemplate(_.assign({url: contribution.url}, templateData));
  }
  if (type.link) {
    var url = _.template(type.link)(templateData);
    return linkTemplate(_.assign({url: url}, templateData));
  }
  return type.symbol;
};
