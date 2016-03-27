'use strict';

var add = require('./add');
var github = require('./github');
var configFile = require('../util').configFile;

module.exports = function addContributor(options, username, contributions, cb) {
  add(options, username, contributions, github, function (error, contributors) {
    if (error) {
      return cb(error);
    }
    configFile.writeContributors(options.config, contributors, function (error) {
      return cb(error, contributors);
    });
  });
};
