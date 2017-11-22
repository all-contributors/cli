import configFile from './config-file.js';

const absentFile = './abc';
const expected = 'Configuration file not found: ' + absentFile;

test('Reading an absent configuration file throws a helpful error', () => {
  expect(() => configFile.readConfig(absentFile)).toThrowError(expected);
});

test('Writing contributors in an absent configuration file throws a helpful error', () => {
  expect(configFile.writeContributors(absentFile, [])).toThrowError(expected);
});
