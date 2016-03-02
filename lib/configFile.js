'use strict';

var fs = require('fs');
var _ = require('lodash/fp');

function formatCommaFirst(o) {
  return JSON.stringify(o, null, 2)
    .split(/(,\n\s+)/)
    .map(function (e, i) {
      return i%2 ? '\n'+e.substring(4)+', ' : e
    })
    .join('');
}

function readConfig(configPath) {
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function writeContributors(configPath, contributors, cb) {
  var config = readConfig(configPath);
  var content = _.assign(config, { contributors: contributors });
  return fs.writeFile(configPath, formatCommaFirst(content), cb);
}

module.exports = {
  readConfig: readConfig,
  writeContributors: writeContributors
}
