'use strict';

var util = require('../util');
var add = require('./add');
var github = require('./github');
var prompt = require('./prompt');

module.exports = function addContributor(options, username, contributions, cb) {
  prompt(options, username, contributions, function (answers) {
    add(options, answers.username, answers.contributions, github, function (error, contributors) {
      if (error) {
        return cb(error);
      }
      util.configFile.writeContributors(options.config, contributors, function (error) {
        return cb(error, contributors);
      });
    });
  });
};
