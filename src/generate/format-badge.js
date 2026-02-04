const util = require('../util')

const defaultTemplate =
  '[![All Contributors](https://img.shields.io/badge/all_contributors-<%= contributors.length %>-orange.svg?style=flat-square)](#contributors-)'

module.exports = function formatBadge(options, contributors) {
  return util.template(options.badgeTemplate || defaultTemplate)({
    contributors,
  })
}
