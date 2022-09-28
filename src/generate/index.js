const _ = require('lodash/fp')
const formatBadge = require('./format-badge')
const formatContributor = require('./format-contributor')

function injectListBetweenTags(newContent) {
  return function (previousContent) {
    const tagToLookFor = `<!-- ALL-CONTRIBUTORS-LIST:`
    const closingTag = '-->'
    const startOfOpeningTagIndex = previousContent.indexOf(
      `${tagToLookFor}START`,
    )
    const endOfOpeningTagIndex = previousContent.indexOf(
      closingTag,
      startOfOpeningTagIndex,
    )
    const startOfClosingTagIndex = previousContent.indexOf(
      `${tagToLookFor}END`,
      endOfOpeningTagIndex,
    )
    if (
      startOfOpeningTagIndex === -1 ||
      endOfOpeningTagIndex === -1 ||
      startOfClosingTagIndex === -1
    ) {
      return previousContent
    }
    const startIndent = Math.max(
      0,
      previousContent.lastIndexOf('\n', startOfOpeningTagIndex),
    )
    const nbSpaces =
      startOfOpeningTagIndex - Math.min(startOfOpeningTagIndex, startIndent)
    return [
      previousContent.slice(0, endOfOpeningTagIndex + closingTag.length),
      '\n<!-- prettier-ignore-start -->',
      '\n<!-- markdownlint-disable -->',
      newContent.replace('\n', `\n${' '.repeat(nbSpaces - 1)}`),
      '<!-- markdownlint-restore -->',
      '\n<!-- prettier-ignore-end -->',
      '\n\n',
      previousContent.slice(startOfClosingTagIndex),
    ].join('')
  }
}

function formatLine(contributors) {
  return `<td align="center">${contributors.join(
    '</td>\n      <td align="center">',
  )}</td>`
}

function formatFooter(options) {
  if (!options.linkToUsage) {
    return ''
  }
  const smallLogoURL =
    'https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg'
  const linkToBotAdd = 'https://all-contributors.js.org/docs/en/bot/usage'

  return `<tr>\n      <td align="center" size="13px" colspan="${options.contributorsPerLine}">\n        <img src="${smallLogoURL}">\n          <a href="${linkToBotAdd}">Add your contributions</a>\n        </img>\n      </td>\n    </tr>`
}

function generateContributorsList(options, contributors) {
  const tableFooter = formatFooter(options)

  return _.flow(
    _.sortBy(contributor => {
      if (options.contributorsSortAlphabetically) {
        return contributor.name
      }
    }),
    _.map(function formatEveryContributor(contributor) {
      return formatContributor(options, contributor)
    }),
    _.chunk(options.contributorsPerLine),
    _.map(formatLine),
    _.join('\n    </tr>\n    <tr>\n      '),
    newContent => {
      return `\n<table>\n  <tbody>\n    <tr>\n      ${newContent}\n    </tr>\n  </tbody>\n  <tfoot>\n    ${tableFooter}\n  </tfoot>\n</table>\n\n`
    },
  )(contributors)
}

function replaceBadge(newContent) {
  return function (previousContent) {
    const tagToLookFor = `<!-- ALL-CONTRIBUTORS-BADGE:`
    const closingTag = '-->'
    const startOfOpeningTagIndex = previousContent.indexOf(
      `${tagToLookFor}START`,
    )
    const endOfOpeningTagIndex = previousContent.indexOf(
      closingTag,
      startOfOpeningTagIndex,
    )
    const startOfClosingTagIndex = previousContent.indexOf(
      `${tagToLookFor}END`,
      endOfOpeningTagIndex,
    )
    if (
      startOfOpeningTagIndex === -1 ||
      endOfOpeningTagIndex === -1 ||
      startOfClosingTagIndex === -1
    ) {
      return previousContent
    }
    const startIndent = Math.max(
      0,
      previousContent.lastIndexOf('\n', startOfOpeningTagIndex),
    )
    const nbSpaces =
      startOfOpeningTagIndex - Math.min(startOfOpeningTagIndex, startIndent)
    return [
      previousContent.slice(0, endOfOpeningTagIndex + closingTag.length),
      '\n',
      newContent.replace('\n', `\n${' '.repeat(nbSpaces)}`),
      '\n',
      previousContent.slice(startOfClosingTagIndex),
    ].join('')
  }
}

module.exports = function generate(options, contributors, fileContent) {
  const contributorsList =
    contributors.length === 0
      ? '\n'
      : generateContributorsList(options, contributors)
  const badge = formatBadge(options, contributors)
  return _.flow(
    injectListBetweenTags(contributorsList),
    replaceBadge(badge),
  )(fileContent)
}
