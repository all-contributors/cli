import test from 'ava';
import configFile from './config-file.js';

const absentFile = './abc';
const expected = 'Configuration file not found: ' + absentFile;

test('Reading an absent configuration file throws a helpful error', t => {
  t.throws(() => configFile.readConfig(absentFile), expected);
});

test('Writing contributors in an absent configuration file throws a helpful error', t => {
  t.throws(configFile.writeContributors(absentFile, []), expected);
});
