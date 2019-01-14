const _ = require('lodash/fp')
const injectContentBetween = require('../util').markdown.injectContentBetween
const formatBadge = require('./format-badge')
const formatContributor = require('./format-contributor')

const badgeRegex = /\[!\[All Contributors\]\([a-zA-Z0-9\-./_:?=]+\)\]\(#\w+\)/

function injectListBetweenTags(newContent) {
  return function(previousContent) {
    const tagToLookFor = '<!-- ALL-CONTRIBUTORS-LIST:'
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
    return [
      previousContent.slice(0, endOfOpeningTagIndex + closingTag.length),
      '\n<!-- prettier-ignore -->',
      newContent,
      previousContent.slice(startOfClosingTagIndex),
    ].join('')
  }
}

function formatLine(contributors) {
  return `| ${contributors.join(' | ')} |`
}

function createColumnLine(contributorsPerLine, contributors) {
  const nbColumns = Math.min(contributorsPerLine, contributors.length)
  return `${_.repeat(nbColumns, '| :---: ')}|`
}

function generateContributorsList(options, contributors) {
  const contributorsPerLine = options.contributorsPerLine || 7
  return _.flow(
    _.map(function formatEveryContributor(contributor) {
      return formatContributor(options, contributor)
    }),
    _.chunk(contributorsPerLine),
    _.map(formatLine),
    function insertColumns(lines) {
      const columnLine = createColumnLine(contributorsPerLine, contributors)
      return injectContentBetween(lines, columnLine, 1, 1)
    },
    _.join('\n'),
    newContent => {
      return `\n${newContent}\n`
    },
  )(contributors)
}

function replaceBadge(newContent) {
  return function(previousContent) {
    const regexResult = badgeRegex.exec(previousContent)
    if (!regexResult) {
      return previousContent
    }
    return (
      previousContent.slice(0, regexResult.index) +
      newContent +
      previousContent.slice(regexResult.index + regexResult[0].length)
    )
  }
}

module.exports = function generate(options, contributors, fileContent) {
  const contributorsList =
    contributors.length === 0
      ? '\n'
      : generateContributorsList(options, contributors)
  const badge = formatBadge(options, contributors)
  return _.flow(injectListBetweenTags(contributorsList), replaceBadge(badge))(
    fileContent,
  )
}
