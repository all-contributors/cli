import test from 'ava';
import configFile from './config-file.js';

const absentFile = './abc';
const expected = 'Configuration file not found: ' + absentFile;

test('Reading an absent configuration file throws a helpful error', t => {
  t.is(
    t.throws(() => {
      configFile.readConfig(absentFile);
    }).message,
    expected
  );
});

test.cb('Writing contributors in an absent configuration file throws a helpful error', t => {
  t.plan(1);
  configFile.writeContributors(absentFile, [], error => {
    t.is(error.message, expected);
    t.end();
  });
});
