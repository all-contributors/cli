import os from 'os'
import path from 'path'
import {promises as fs} from 'fs'
import {test, expect} from 'vitest'
import {
  writeConfig,
  readConfig,
  readRawConfig,
  writeContributors,
} from '../config-file.js'

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

test('writeContributors does not inject repoType or commitConvention if absent', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'all-contrib-'))
  const configPath = path.join(tmpDir, '.all-contributorsrc')
  const initialConfig = {
    projectName: 'test-project',
    projectOwner: 'test-owner',
    contributors: [],
  }
  await fs.writeFile(configPath, JSON.stringify(initialConfig, null, 2))

  const newContributors = [
    {
      login: 'alice',
      name: 'Alice',
      avatar_url: 'https://example.com/alice.png',
      profile: 'https://example.com/alice',
      contributions: ['doc'],
    },
  ]

  await writeContributors(configPath, newContributors)

  const rawConfig = await readRawConfig(configPath)
  expect(rawConfig.contributors).toHaveLength(1)
  expect(rawConfig.contributors[0].login).toBe('alice')
  expect(rawConfig.repoType).toBeUndefined()
  expect(rawConfig.commitConvention).toBeUndefined()

  const configWithDefaults = await readConfig(configPath)
  expect(configWithDefaults.repoType).toBe('github')
  expect(configWithDefaults.commitConvention).toBe('angular')

  await fs.rm(tmpDir, {recursive: true, force: true})
})

test('writeContributors preserves existing repoType and commitConvention', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'all-contrib-'))
  const configPath = path.join(tmpDir, '.all-contributorsrc')
  const initialConfig = {
    projectName: 'test-project',
    projectOwner: 'test-owner',
    repoType: 'gitlab',
    commitConvention: 'gitmoji',
    contributors: [],
  }
  await fs.writeFile(configPath, JSON.stringify(initialConfig, null, 2))

  await writeContributors(configPath, [])

  const rawConfig = await readRawConfig(configPath)
  expect(rawConfig.repoType).toBe('gitlab')
  expect(rawConfig.commitConvention).toBe('gitmoji')

  await fs.rm(tmpDir, {recursive: true, force: true})
})
