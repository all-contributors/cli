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

test('Reading an absent configuration file throws error with ENOENT code', async () => {
  let error
  try {
    await readConfig(absentFile)
  } catch (err) {
    error = err
  }
  expect(error).toBeDefined()
  expect(error.code).toBe('ENOENT')
  expect(error.message).toBe(absentConfigFileExpected)
})

test('Reading a malformed configuration file throws SyntaxError with file path and details', async () => {
  const fs = await import('fs/promises')
  const path = await import('path')
  const os = await import('os')

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'all-contrib-'))
  const malformedConfigPath = path.join(tempDir, '.all-contributorsrc')
  await fs.writeFile(
    malformedConfigPath,
    '{ "projectOwner": "all-contributors", invalid json }',
  )

  try {
    await expect(readConfig(malformedConfigPath)).rejects.toThrow(SyntaxError)
    await expect(readConfig(malformedConfigPath)).rejects.toThrow(
      `Configuration file has malformed JSON: ${malformedConfigPath}`,
    )
  } finally {
    await fs.rm(tempDir, {recursive: true, force: true})
  }
})
