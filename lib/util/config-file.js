'use strict';

var fs = require('fs');
var _ = require('lodash/fp');

function readConfig(configPath) {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('Configuration file not found: ' + configPath);
    }
    throw error;
  }
}

function writeConfig(configPath, content, cb) {
  return fs.writeFile(configPath, JSON.stringify(content, null, 2) + '\n', cb);
}

function writeContributors(configPath, contributors, cb) {
  var config;
  try {
    config = readConfig(configPath);
  } catch (error) {
    return cb(error);
  }
  var content = _.assign(config, {contributors: contributors});
  return writeConfig(configPath, content, cb);
}

module.exports = {
  readConfig: readConfig,
  writeConfig: writeConfig,
  writeContributors: writeContributors
};
