const fs = require('fs')
const pify = require('pify')
const _ = require('lodash/fp')

function readConfig(configPath) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    if (!('repoType' in config)) {
      config.repoType = 'github'
    }
    return config
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Configuration file not found: ${configPath}`)
    }
    throw error
  }
}

function writeConfig(configPath, content) {
  if (content.projectOwner === '') {
    throw new Error(`Error! Project Name is not set in ${configPath}`)
  }
  if (content.projectName === '') {
    throw new Error(`Error! Project Name is not set in ${configPath}`)
  }
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
