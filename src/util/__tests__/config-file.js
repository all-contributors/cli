import configFile from '../config-file'

const absentFile = './abc'
const expected = `Configuration file not found: ${absentFile}`

test('Reading an absent configuration file throws a helpful error', () => {
  expect(() => configFile.readConfig(absentFile)).toThrowError(expected)
})

test('Writing contributors in an absent configuration file throws a helpful error', async () => {
  const resolvedError = await configFile
    .writeContributors(absentFile, [])
    .catch(e => e)
  expect(resolvedError.message).toBe(expected)
})
