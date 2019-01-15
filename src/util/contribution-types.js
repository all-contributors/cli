const _ = require('lodash/fp')
const repo = require('../repo')

const defaultTypes = function(repoType) {
  return {
    blog: {
      symbol: '📝',
      description: 'Blogposts',
    },
    bug: {
      symbol: '🐛',
      description: 'Bug reports',
      link: repo.getLinkToIssues(repoType),
    },
    code: {
      symbol: '💻',
      description: 'Code',
      link: repo.getLinkToCommits(repoType),
    },
    design: {
      symbol: '🎨',
      description: 'Design',
    },
    doc: {
      symbol: '📖',
      description: 'Documentation',
      link: repo.getLinkToCommits(repoType),
    },
    eventOrganizing: {
      symbol: '📋',
      description: 'Event Organizing',
    },
    example: {
      symbol: '💡',
      description: 'Examples',
    },
    financial: {
      symbol: '💵',
      description: 'Financial',
    },
    fundingFinding: {
      symbol: '🔍',
      description: 'Funding Finding',
    },
    ideas: {
      symbol: '🤔',
      description: 'Ideas, Planning, & Feedback',
    },
    infra: {
      symbol: '🚇',
      description: 'Infrastructure (Hosting, Build-Tools, etc)',
    },
    platform: {
      symbol: '📦',
      description: 'Packaging/porting to new platform',
    },
    plugin: {
      symbol: '🔌',
      description: 'Plugin/utility libraries',
    },
    question: {
      symbol: '💬',
      description: 'Answering Questions',
    },
    review: {
      symbol: '👀',
      description: 'Reviewed Pull Requests',
    },
    security: {
      symbol: '🛡️',
      description: 'Security',
    },
    talk: {
      symbol: '📢',
      description: 'Talks',
    },
    test: {
      symbol: '⚠️',
      description: 'Tests',
      link: repo.getLinkToCommits(repoType),
    },
    tool: {
      symbol: '🔧',
      description: 'Tools',
    },
    translation: {
      symbol: '🌍',
      description: 'Translation',
    },
    tutorial: {
      symbol: '✅',
      description: 'Tutorials',
    },
    userTesting: {
      symbol: '📓',
      description: 'User Testing',
    },
    video: {
      symbol: '📹',
      description: 'Videos',
    },
    maintenance: {
      symbol: '👷',
      description: 'Maintenance',
    },
  }
}

module.exports = function(options) {
  return _.assign(defaultTypes(options.repoType), options.types)
}
