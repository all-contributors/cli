const fs = require('fs')
const pify = require('pify')

function read(filePath) {
  return pify(fs.readFile)(filePath, 'utf8')
}

function write(filePath, content) {
  return pify(fs.writeFile)(filePath, content)
}

function injectContentBetween(lines, content, startIndex, endIndex) {
  return [].concat(lines.slice(0, startIndex), content, lines.slice(endIndex))
}

module.exports = {
  read,
  write,
  injectContentBetween,
}
