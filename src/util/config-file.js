import {promises as fs} from 'fs'
import jf from 'json-fixer'
import {formatConfig} from './formatting.js'

export async function readConfig(configPath) {
  let configFileContents
  try {
    configFileContents = await fs.readFile(configPath, 'utf-8')
  } catch (error) {
    if (error.code === 'ENOENT') {
      const notFoundError = new Error(
        `Configuration file not found: ${configPath}`,
      )
      notFoundError.code = 'ENOENT'
      throw notFoundError
    }
    throw error
  }

  let config
  let changed
  try {
    const result = jf(configFileContents)
    config = result.data
    changed = result.changed
  } catch (error) {
    throw new SyntaxError(
      `Configuration file has malformed JSON: ${configPath}. Error:: ${error.message}`,
    )
  }

  if (!config || typeof config !== 'object') {
    throw new SyntaxError(
      `Configuration file has malformed JSON: ${configPath}. Error:: Expected valid JSON object`,
    )
  }

  if (!('repoType' in config)) {
    config.repoType = 'github'
  }

  if (!('commitConvention' in config)) {
    config.commitConvention = 'angular'
  }

  if (changed) {
    const formatterConfig = await formatConfig(configPath, config)
    //Updates the file with fixes
    await fs.writeFile(configPath, formatterConfig)
  }

  return config
}

export async function writeConfig(configPath, content) {
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

  return fs.writeFile(
    configPath,
    `${await formatConfig(configPath, content)}\n`,
  )
}

export async function writeContributors(configPath, contributors) {
  let config

  try {
    config = await readConfig(configPath)
  } catch (error) {
    return Promise.reject(error)
  }
  const content = {...config, contributors}

  return writeConfig(configPath, content)
}
