'use strict';

var _ = require('lodash/fp');

var linkToCommits = 'https://github.com/<%= options.projectOwner %>/<%= options.projectName %>/commits?author=<%= contributor.login %>';
var linkToIssues = 'https://github.com/<%= options.projectOwner %>/<%= options.projectName %>/issues?q=author%3A<%= contributor.login %>';

var defaultTypes = {
  blog: {
    symbol: '📝',
    description: 'Blogposts'
  },
  bug: {
    symbol: '🐛',
    description: 'Bug reports',
    link: linkToIssues
  },
  code: {
    symbol: '💻',
    description: 'Code',
    link: linkToCommits
  },
  design: {
    symbol: '🎨',
    description: 'Design'
  },
  doc: {
    symbol: '📖',
    description: 'Documentation',
    link: linkToCommits
  },
  example: {
    symbol: '💡',
    description: 'Examples'
  },
  infra: {
    symbol: '🚇',
    description: 'Infrastructure (Hosting, Build-Tools, etc)'
  },
  plugin: {
    symbol: '🔌',
    description: 'Plugin/utility libraries'
  },
  question: {
    symbol: '💬',
    description: 'Answering Questions'
  },
  review: {
    symbol: '👀',
    description: 'Reviewed Pull Requests'
  },
  talk: {
    symbol: '📢',
    description: 'Talks'
  },
  test: {
    symbol: '⚠️',
    description: 'Tests',
    link: linkToCommits
  },
  translation: {
    symbol: '🌍',
    description: 'Translation'
  },
  tool: {
    symbol: '🔧',
    description: 'Tools'
  },
  tutorial: {
    symbol: '✅',
    description: 'Tutorials'
  },
  video: {
    symbol: '📹',
    description: 'Videos'
  },
  financial: {
    symbol: '💵',
    description: 'Financial'
  },
  fundingFinding: {
    symbol: '🔍',
    description: 'Funding Finding'
  },
  eventOrganizing: {
    symbol: '📋',
    description: 'Event Organizing'
  }
};

module.exports = function (options) {
  return _.assign(defaultTypes, options.types);
};
