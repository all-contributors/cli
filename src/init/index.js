const { configFile } = require('../util')
const prompt = require('./prompt')
const initContent = require('./init-content')
const injectInFile = require('./injectInFile')

function initCommand() {
  return prompt().then(result => {
    return configFile
      .writeConfig('.all-contributorsrc', result.config)
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

module.exports = initCommand
