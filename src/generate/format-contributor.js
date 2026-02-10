const util = require('../util')
const formatContributionType = require('./format-contribution-type')

const avatarTemplate = util.template(
  '<img src="<%= contributor.avatar_url %>?s=<%= options.imageSize %>" width="<%= options.imageSize %>px;" alt="<%= name %>"/>',
)
const avatarBlockTemplate = util.template(
  '<a href="<%= contributor.profile %>"><%= avatar %><br /><sub><b><%= name %></b></sub></a>',
)
const avatarBlockTemplateNoProfile = util.template(
  '<%= avatar %><br /><sub><b><%= name %></b></sub>',
)
const contributorTemplate = util.template(
  '<%= avatarBlock %><br /><%= contributions %>',
)

const defaultImageSize = 100

function defaultTemplate(templateData) {
  const rawName =
    templateData.contributor.name || templateData.contributor.login
  const name = escapeName(rawName)
  const avatar = avatarTemplate({
    ...templateData,
    name,
  })
  const avatarBlockTemplateData = {
    name,
    avatar,
    ...templateData,
  }
  let avatarBlock = null

  if (templateData.contributor.profile) {
    avatarBlock = avatarBlockTemplate(avatarBlockTemplateData)
  } else {
    avatarBlock = avatarBlockTemplateNoProfile(avatarBlockTemplateData)
  }

  return contributorTemplate({avatarBlock, ...templateData})
}

function escapeName(name) {
  return name
    .replace(new RegExp('\\|', 'g'), '&#124;')
    .replace(new RegExp('\\"', 'g'), '&quot;')
}

module.exports = function formatContributor(options, contributor) {
  const formatter = contribution =>
    formatContributionType(options, contributor, contribution)
  const contributions = contributor.contributions.map(formatter).join(' ')
  const templateData = {
    contributions,
    contributor,
    options: {imageSize: defaultImageSize, ...options},
  }
  const customTemplate =
    options.contributorTemplate && util.template(options.contributorTemplate)
  return (customTemplate || defaultTemplate)(templateData)
}
