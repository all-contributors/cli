const fs = require('fs')
const pify = require('pify')
const _ = require('lodash/fp')

function readConfig(configPath) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    if (!('repoType' in config)) {
      config.repoType = 'github'
    }
    if (!('commitConvention' in config)) {
      config.commitConvention = 'none'
    }
    return config
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new SyntaxError(
        `Configuration file has malformed JSON: ${configPath}. Error:: ${
          error.message
        }`,
      )
    }
    if (error.code === 'ENOENT') {
      throw new Error(`Configuration file not found: ${configPath}`)
    }
    throw error
  }
}

function writeConfig(configPath, content) {
  if (!content.projectOwner) {
    throw new Error(`Error! Project owner is not set in ${configPath}`)
  }
  if (!content.projectName) {
    throw new Error(`Error! Project name is not set in ${configPath}`)
  }

  if (content.files && !content.files.length) {
    throw new Error(
      `Error! Project files was overridden and is empty in ${configPath}`,
    )
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
