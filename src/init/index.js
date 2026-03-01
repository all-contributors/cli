import * as util from '../util/index.js'
import {prompt} from './prompt.js'
import {addBadge, addContributorsList} from './init-content.js'
import {ensureFileExists} from './file-exist.js'

const {configFile, markdown} = util.markdown

function injectInFile(file, fn) {
  return markdown.read(file).then(content => markdown.write(file, fn(content)))
}

export function init() {
  return prompt().then(result => {
    return configFile
      .writeConfig('.all-contributorsrc', result.config)
      .then(() => {
        ensureFileExists(result.contributorFile)
      })
      .then(() => injectInFile(result.contributorFile, addContributorsList))
      .then(() => {
        if (result.badgeFile) {
          return injectInFile(result.badgeFile, addBadge)
        }
      })
  })
}
