const badgeContent = [
  '<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->',
  '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)',
  '<!-- ALL-CONTRIBUTORS-BADGE:END -->',
].join('\n')

function getHeaderContent(docsLocale = 'en') {
  return `Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/${docsLocale}/emoji-key)):`
}

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

function injectContentBetween(lines, content, startIndex, endIndex) {
  return [].concat(lines.slice(0, startIndex), content, lines.slice(endIndex))
}

function addBadgeImpl(lines) {
  return injectContentBetween(lines, badgeContent, 1, 1)
}

function splitAndRejoin(fn) {
  return function (content, options) {
    const lines = content.split('\n')
    const result = fn(lines, options)
    return result.join('\n')
  }
}

function findContributorsSection(lines) {
  return lines.findIndex(
    str => str.toLowerCase().indexOf('# contributors') === 1,
  )
}

function addContributorsListImpl(lines, options) {
  const insertionLine = findContributorsSection(lines)
  const docsLocale = options?.docsLocale || options?.locale || 'en'
  const header = getHeaderContent(docsLocale)

  if (insertionLine === -1) {
    return lines.concat([
      '## Contributors ✨',
      '',
      header,
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

export const addBadge = splitAndRejoin(addBadgeImpl)
export const addContributorsList = splitAndRejoin(addContributorsListImpl)
