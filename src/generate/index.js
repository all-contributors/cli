import * as util from '../util/index.js'
import {formatBadge} from './format-badge.js'
import {formatContributor} from './format-contributor.js'

function chunk(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

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

function formatLine(options, contributors) {
  const width = Math.floor((100 / options.contributorsPerLine) * 100) / 100
  const attributes = `align="center" valign="top" width="${width}%"`

  return `<td ${attributes}>${contributors.join(
    `</td>\n      <td ${attributes}>`,
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
  const defaultWrapperTemplate = util.template(
    '\n<table>\n  <tbody><%= bodyContent %>  </tbody>\n<%= tableFooterContent %></table>\n\n',
  )
  const wrapperTemplate = options.wrapperTemplate
    ? util.template(`\n${options.wrapperTemplate}\n\n`)
    : defaultWrapperTemplate
  const seperator = options.wrapperTemplate
    ? '\n    </tr><br />\n    <tr>\n      '
    : '\n    </tr>\n    <tr>\n      '

  let tableFooterContent = ''

  const sortedContributors = [...contributors]
  if (options.contributorsSortAlphabetically) {
    sortedContributors.sort((a, b) =>
      (a.name || '').localeCompare(b.name || ''),
    )
  }

  const formattedContributors = sortedContributors.map(contributor =>
    formatContributor(options, contributor),
  )

  const chunkedContributors = chunk(
    formattedContributors,
    options.contributorsPerLine,
  )

  const formattedLines = chunkedContributors.map(currentLineContributors =>
    formatLine(options, currentLineContributors),
  )

  const newContent = formattedLines.join(seperator)

  if (options.linkToUsage) {
    tableFooterContent = `  <tfoot>\n    ${tableFooter}\n  </tfoot>\n`
  }

  const bodyContent = `\n    <tr>\n      ${newContent}\n    </tr>\n`

  return wrapperTemplate({bodyContent, tableFooterContent})
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

export function generate(options, contributors, fileContent) {
  const contributorsList =
    contributors.length === 0
      ? '\n'
      : generateContributorsList(options, contributors)
  const badge = formatBadge(options, contributors)

  let result = fileContent
  result = injectListBetweenTags(contributorsList)(result)
  result = replaceBadge(badge)(result)
  return result
}
