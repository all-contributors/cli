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
  eventOrganizing: {
    symbol: '📋',
    description: 'Event Organizing'
  },
  example: {
    symbol: '💡',
    description: 'Examples'
  },
  financial: {
    symbol: '💵',
    description: 'Financial'
  },
  fundingFinding: {
    symbol: '🔍',
    description: 'Funding Finding'
  },
  ideas: {
    symbol: '🤔',
    description: 'Ideas, Planning, & Feedback'
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
  tool: {
    symbol: '🔧',
    description: 'Tools'
  },
  translation: {
    symbol: '🌍',
    description: 'Translation'
  },
  tutorial: {
    symbol: '✅',
    description: 'Tutorials'
  },
  video: {
    symbol: '📹',
    description: 'Videos'
  }
};

module.exports = function (options) {
  return _.assign(defaultTypes, options.types);
};
