'use strict';

var fs = require('fs');
var pify = require('pify');
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

function writeConfig(configPath, content) {
  return pify(fs.writeFile)(configPath, JSON.stringify(content, null, 2) + '\n');
}

function writeContributors(configPath, contributors) {
  var config;
  try {
    config = readConfig(configPath);
  } catch (error) {
    return Promise.reject(error);
  }
  var content = _.assign(config, {contributors: contributors});
  return writeConfig(configPath, content);
}

module.exports = {
  readConfig: readConfig,
  writeConfig: writeConfig,
  writeContributors: writeContributors
};
