import {promises as fs} from 'fs'
import {configFile} from '../util/index.js'
import {prompt} from './prompt.js'
import {addBadge, addContributorsList} from './init-content.js'

async function ensureFileExists(file) {
  try {
    await fs.access(file)
    return file
  } catch {
    await fs.writeFile(file, '')
    return file
  }
}

async function injectInFile(file, fn) {
  const content = await fs.readFile(file, 'utf8')

  await fs.writeFile(file, fn(content))
}

export async function init() {
  const promptResult = await prompt()

  await configFile.writeConfig('.all-contributorsrc', promptResult.config)

  await ensureFileExists(promptResult.contributorFile)

  await injectInFile(promptResult.contributorFile, addContributorsList)

  if (promptResult.badgeFile) {
    await injectInFile(promptResult.badgeFile, addBadge)
  }
}
