const initContent = require('./init-content')
const injectInFile = require('./injectInFile')

function init(content) {
  return injectInFile(content, initContent.addContributorsList).then(() => {
    return injectInFile(content, initContent.addBadge)
  })
}

module.exports = {
  init,
}
