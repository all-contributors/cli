import {test, expect, vi} from 'vitest'
import path from 'path'
import {promises as fs} from 'fs'
import {
  writeConfig,
  readConfig,
  writeContributors,
  findConfigFile,
  CONFIG_FILES,
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

test('CONFIG_FILES contains standard root and .config file paths', () => {
  expect(CONFIG_FILES).toContain('.all-contributorsrc')
  expect(CONFIG_FILES).toContain('.all-contributors.json')
  expect(CONFIG_FILES).toContain('.config/all-contributors.json')
})

test('findConfigFile detects .all-contributorsrc in current working directory', async () => {
  const result = await findConfigFile(process.cwd())
  // The CLI repo root contains .all-contributorsrc
  expect(result).toBe(path.resolve(process.cwd(), '.all-contributorsrc'))
})

test('findConfigFile detects .all-contributors.json when .all-contributorsrc is absent', async () => {
  const mockDir = '/virtual/project'
  const accessSpy = vi.spyOn(fs, 'access').mockImplementation(async target => {
    if (target === path.resolve(mockDir, '.all-contributors.json')) {
      return undefined
    }
    throw new Error('ENOENT')
  })

  const result = await findConfigFile(mockDir)
  expect(result).toBe(path.resolve(mockDir, '.all-contributors.json'))

  accessSpy.mockRestore()
})

test('findConfigFile detects .config/all-contributors.json in .config subdirectory', async () => {
  const mockDir = '/virtual/project'
  const accessSpy = vi.spyOn(fs, 'access').mockImplementation(async target => {
    if (target === path.resolve(mockDir, '.config/all-contributors.json')) {
      return undefined
    }
    throw new Error('ENOENT')
  })

  const result = await findConfigFile(mockDir)
  expect(result).toBe(path.resolve(mockDir, '.config/all-contributors.json'))

  accessSpy.mockRestore()
})

test('findConfigFile returns null when no config files exist', async () => {
  const mockDir = '/virtual/empty-project'
  const accessSpy = vi
    .spyOn(fs, 'access')
    .mockRejectedValue(new Error('ENOENT'))

  const result = await findConfigFile(mockDir)
  expect(result).toBeNull()

  accessSpy.mockRestore()
})
