import path from 'path'
import {promises as fs} from 'fs'
import jf from 'json-fixer'
import {formatConfig} from './formatting.js'

export const CONFIG_FILES = [
  '.all-contributorsrc',
  '.all-contributorsrc.json',
  '.all-contributors.json',
  '.config/.all-contributorsrc',
  '.config/.all-contributorsrc.json',
  '.config/all-contributors.json',
]

export async function findConfigFile(cwd = process.cwd()) {
  for (const filename of CONFIG_FILES) {
    const fullPath = path.resolve(cwd, filename)
    try {
      await fs.access(fullPath)
      return fullPath
    } catch {
      // continue searching
    }
  }
  return null
}

export async function readConfig(configPath) {
  try {
    const configFileContents = await fs.readFile(configPath, 'utf-8')
    const {data: config, changed} = jf(configFileContents)

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
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new SyntaxError(
        `Configuration file has malformed JSON: ${configPath}. Error:: ${error.message}`,
      )
    }

    if (error.code === 'ENOENT') {
      throw new Error(`Configuration file not found: ${configPath}`)
    }

    throw error
  }
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
