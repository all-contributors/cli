import configFile from '../config-file'

const absentFile = './abc'
const expected = `Configuration file not found: ${absentFile}`
const configFileContent_NoOwner = {
  projectOwner: '',
  projectName: 'all-contributors-cli',
  imageSize: 100,
  commit: false,
  contributorsPerLine: 6,
  contributors: [],
}
const configFileContent_NoName = {
  projectOwner: 'jfmengels',
  projectName: '',
  imageSize: 100,
  commit: false,
  contributorsPerLine: 6,
  contributors: [],
}

test('Reading an absent configuration file throws a helpful error', () => {
  expect(() => configFile.readConfig(absentFile)).toThrowError(expected)
})

test('Writing contributors in an absent configuration file throws a helpful error', async () => {
  const resolvedError = await configFile
    .writeContributors(absentFile, [])
    .catch(e => e)
  expect(resolvedError.message).toBe(expected)
})

test('Should throw error and not edit config file if project name or owner is not set', () => {
  const configPath = './.all-contributorsrc'
  expect(() =>
    configFile.writeConfig(configPath, configFileContent_NoOwner),
  ).toThrow(`Error! Project Name is not set in ${configPath}`)
  expect(() =>
    configFile.writeConfig(configPath, configFileContent_NoName),
  ).toThrow(`Error! Project Name is not set in ${configPath}`)
})
