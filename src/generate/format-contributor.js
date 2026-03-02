import * as util from '../util/index.js'
import {formatContributionType} from './format-contribution-type.js'

const avatarTemplate = util.template(
  '<img src="<%= contributor.avatar_url %>" width="<%= options.imageSize %>px" height="<%= options.imageSize %>px" alt="<%= name %>"/>',
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

export function formatContributor(options, contributor) {
  const formatter = contribution =>
    formatContributionType(options, contributor, contribution)
  const contributions = contributor.contributions.map(formatter).join(' ')

  const contributorAvatarUrl = new URL(contributor.avatar_url)

  contributorAvatarUrl.searchParams.append(
    'size',
    options.imageSize ?? defaultImageSize,
  )

  const templateData = {
    contributions,
    contributor: {
      ...contributor,
      avatar_url: contributorAvatarUrl.toString(),
    },
    options: {imageSize: defaultImageSize, ...options},
  }

  const customTemplate =
    options.contributorTemplate && util.template(options.contributorTemplate)

  return (customTemplate || defaultTemplate)(templateData)
}
