const _ = require('lodash/fp')
const injectContentBetween = require('../util').markdown.injectContentBetween

const badgeContent = [
  '<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->',
  '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)',
  '<!-- ALL-CONTRIBUTORS-BADGE:END -->',
].join('\n')

const headerContent =
  'Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):'
const listContent = [
  '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->',
  '<!-- prettier-ignore-start -->',
  '<!-- markdownlint-disable -->',
  '<!-- markdownlint-restore -->',
  '<!-- prettier-ignore-end -->',
  '<!-- ALL-CONTRIBUTORS-LIST:END -->',
].join('\n')
const footerContent =
  'This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!'

function addBadge(lines) {
  return injectContentBetween(lines, badgeContent, 1, 1)
}

function splitAndRejoin(fn) {
  return _.flow(
    _.split('\n'),
    fn,
    _.join('\n'),
  )
}

const findContributorsSection = _.findIndex(function isContributorsSection(
  str,
) {
  return str.toLowerCase().indexOf('# contributors') === 1
})

function addContributorsList(lines) {
  const insertionLine = findContributorsSection(lines)
  if (insertionLine === -1) {
    return lines.concat([
      '## Contributors ✨',
      '',
      headerContent,
      '',
      listContent,
      '',
      footerContent,
    ])
  }
  return injectContentBetween(
    lines,
    listContent,
    insertionLine + 3,
    insertionLine + 3,
  )
}

module.exports = {
  addBadge: splitAndRejoin(addBadge),
  addContributorsList: splitAndRejoin(addContributorsList),
}
