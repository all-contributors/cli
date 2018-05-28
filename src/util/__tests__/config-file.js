import configFile from '../config-file'

const absentFile = './abc'
const absentConfileFileExpected = `Configuration file not found: ${absentFile}`
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
  projectOwner: 'jfmengels',
  projectName: '',
  imageSize: 100,
  commit: false,
  contributorsPerLine: 6,
  contributors: [],
}

test('Reading an absent configuration file throws a helpful error', () => {
  expect(() => configFile.readConfig(absentFile)).toThrowError(
    absentConfileFileExpected,
  )
})

test('Writing contributors in an absent configuration file throws a helpful error', async () => {
  const resolvedError = await configFile
    .writeContributors(absentFile, [])
    .catch(e => e)
  expect(resolvedError.message).toBe(absentConfileFileExpected)
})

test('Should throw error and not allow editing config file if project name or owner is not set', () => {
  expect(() =>
    configFile.writeConfig(incompleteConfigFilePath, NoOwnerConfigFile),
  ).toThrow(`Error! Project owner is not set in ${incompleteConfigFilePath}`)
  expect(() =>
    configFile.writeConfig(incompleteConfigFilePath, NoNameConfigFile),
  ).toThrow(`Error! Project name is not set in ${incompleteConfigFilePath}`)
})
