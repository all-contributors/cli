const fs = require('fs')
const pify = require('pify')
const _ = require('lodash/fp')

function readConfig(configPath) {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Configuration file not found: ${configPath}`)
    }
    throw error
  }
}

function writeConfig(configPath, content) {
  return pify(fs.writeFile)(configPath, `${JSON.stringify(content, null, 2)}\n`)
}

function writeContributors(configPath, contributors) {
  let config
  try {
    config = readConfig(configPath)
  } catch (error) {
    return Promise.reject(error)
  }
  const content = _.assign(config, {contributors})
  return writeConfig(configPath, content)
}

module.exports = {
  readConfig,
  writeConfig,
  writeContributors,
}
