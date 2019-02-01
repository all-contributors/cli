const util = require('../util')
const prompt = require('./prompt')
const initContent = require('./init-content')
const check = require('./check-file')

const configFile = util.configFile
const markdown = util.markdown

function injectInFile(file, fn) {
  return markdown.read(file).then(content => markdown.write(file, fn(content)))
}

module.exports = function init() {
  return prompt().then(result => {
    return configFile
      .writeConfig('.all-contributorsrc', result.config)
      .then(() => {
        check(result.contributorFile)
      })
      .then(() =>
        injectInFile(result.contributorFile, initContent.addContributorsList),
      )
      .then(() => {
        if (result.badgeFile) {
          return injectInFile(result.badgeFile, initContent.addBadge)
        }
      })
  })
}
