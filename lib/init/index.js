'use strict';

var prompt = require('./prompt');
var configFile = require('../configFile');

module.exports = function init(cb) {
  prompt(function postPrompt(result) {
    configFile.writeConfig('.all-contributorsrc', result.config, cb);
  });
};
