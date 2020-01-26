const _ = require('lodash/fp')
const repo = require('../repo')

const defaultTypes = function(repoType) {
  return {
    a11y: {
      symbol: '️️️️♿️',
      description: 'Accessibility',
    },
    blog: {
      symbol: '📝',
      description: 'Blogposts',
    },
    bug: {
      symbol: '🐛',
      description: 'Bug reports',
      link: repo.getLinkToIssues(repoType),
    },
    business: {
      symbol: '💼',
      description: 'Business development',
    },
    code: {
      symbol: '💻',
      description: 'Code',
      link: repo.getLinkToCommits(repoType),
    },
    content: {
      symbol: '🖋',
      description: 'Content',
    },
    data: {
      symbol: '🔣',
      description: 'Data',
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
    maintenance: {
      symbol: '🚧',
      description: 'Maintenance',
    },
    platform: {
      symbol: '📦',
      description: 'Packaging/porting to new platform',
    },
    plugin: {
      symbol: '🔌',
      description: 'Plugin/utility libraries',
    },
    projectManagement: {
      symbol: '📆',
      description: 'Project Management',
    },
    question: {
      symbol: '💬',
      description: 'Answering Questions',
    },
    review: {
      symbol: '👀',
      description: 'Reviewed Pull Requests',
      link: repo.getLinkToReviews(repoType),
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
  }
}

module.exports = function(options) {
  return _.assign(defaultTypes(options.repoType), options.types)
}
