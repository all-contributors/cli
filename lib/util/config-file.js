'use strict';

var fs = require('fs');
var _ = require('lodash/fp');

function readConfig(configPath) {
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function writeConfig(configPath, content, cb) {
  return fs.writeFile(configPath, JSON.stringify(content, null, 2) + '\n', cb);
}

function writeContributors(configPath, contributors, cb) {
  var config = readConfig(configPath);
  var content = _.assign(config, {contributors: contributors});
  return writeConfig(configPath, content, cb);
}

module.exports = {
  readConfig: readConfig,
  writeConfig: writeConfig,
  writeContributors: writeContributors
};
