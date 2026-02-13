import _ from 'lodash/fp.js'

const defaultTemplate =
  '[![All Contributors](https://img.shields.io/badge/all_contributors-<%= contributors.length %>-orange.svg?style=flat-square)](#contributors-)'

export function formatBadge(options, contributors) {
  return _.template(options.badgeTemplate || defaultTemplate)({
    contributors,
  })
}
