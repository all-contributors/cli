'use strict';

var _ = require('lodash/fp');

var linkToCommits = 'https://github.com/<%= options.projectOwner %>/<%= options.projectName %>/commits?author=<%= contributor.login %>';
var linkToIssues = 'https://github.com/<%= options.projectOwner %>/<%= options.projectName %>/issues?q=author%3A<%= contributor.login %>';

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

module.exports = function (options) {
  return _.assign(defaultTypes, options.types);
};
