import {promises as fs} from 'fs'
import os from 'os'
import path from 'path'
import {test, expect} from 'vitest'
import {writeConfig, readConfig, writeContributors} from '../config-file.js'

const absentFile = './abc'
const absentConfigFileExpected = `Configuration file not found: ${absentFile}`
const incompleteConfigFilePath = './.all-contributorsrc'
const NoOwnerConfigFile = {
  projectOwner: '',
  projectName: 'all-contributors-cli',
  imageSize: 100,
  commit: false,
  contributorsPerLine: 6,
  contributors: [],
}
const NoNameConfigFile = {
  projectOwner: 'all-contributors',
  projectName: '',
  imageSize: 100,
  commit: false,
  contributorsPerLine: 6,
  contributors: [],
}
const NoFilesConfigFile = {
  projectOwner: 'all-contributors',
  projectName: 'all-contributors-cli',
  imageSize: 100,
  commit: false,
  contributorsPerLine: 6,
  contributors: [],
  files: [],
}

test('Reading an absent configuration file throws a helpful error', async () => {
  await expect(readConfig(absentFile)).rejects.toThrow(absentConfigFileExpected)
})

test('Writing contributors in an absent configuration file throws a helpful error', async () => {
  await expect(writeContributors(absentFile, [])).rejects.toThrow(
    absentConfigFileExpected,
  )
})

test('Should throw error and not allow editing config file if project name or owner is not set', async () => {
  await expect(
    writeConfig(incompleteConfigFilePath, NoOwnerConfigFile),
  ).rejects.toThrow(
    `Error! Project owner is not set in ${incompleteConfigFilePath}`,
  )

  await expect(
    writeConfig(incompleteConfigFilePath, NoNameConfigFile),
  ).rejects.toThrow(
    `Error! Project name is not set in ${incompleteConfigFilePath}`,
  )
})

test(`throws if 'files' was overridden in .all-contributorsrc and is empty`, async () => {
  await expect(
    writeConfig(incompleteConfigFilePath, NoFilesConfigFile),
  ).rejects.toThrow(
    `Error! Project files was overridden and is empty in ${incompleteConfigFilePath}`,
  )
})

async function createConfigFile(content) {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'all-contributors-'),
  )
  const configPath = path.join(directory, '.all-contributorsrc')
  await fs.writeFile(configPath, JSON.stringify(content, null, 2))
  return configPath
}

const MinimalConfigFile = {
  projectOwner: 'all-contributors',
  projectName: 'all-contributors-cli',
  contributors: [],
}

test('reading a config file without repoType or commitConvention applies their defaults', async () => {
  const configPath = await createConfigFile(MinimalConfigFile)

  expect(await readConfig(configPath)).toEqual({
    ...MinimalConfigFile,
    commitConvention: 'angular',
    repoType: 'github',
  })
})

test('writing contributors does not add default repoType or commitConvention to the config file', async () => {
  const configPath = await createConfigFile(MinimalConfigFile)
  const contributors = [{login: 'jfmengels', contributions: ['code']}]

  await writeContributors(configPath, contributors)

  expect(JSON.parse(await fs.readFile(configPath, 'utf-8'))).toEqual({
    ...MinimalConfigFile,
    contributors,
  })
})
