import fs from 'fs'
import pify from 'pify'

export function read(filePath) {
  return pify(fs.readFile)(filePath, 'utf8')
}

export function write(filePath, content) {
  return pify(fs.writeFile)(filePath, content)
}

export function injectContentBetween(lines, content, startIndex, endIndex) {
  return [].concat(lines.slice(0, startIndex), content, lines.slice(endIndex))
}
