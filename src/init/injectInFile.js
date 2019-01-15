const { markdown} = require('../util')

function injectInFile(file, fn) {
  return markdown.read(file).then(content => markdown.write(file, fn(content)))
}

module.exports = injectInFile
