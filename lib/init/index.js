'use strict';

var _ = require('lodash/fp');
var series = require('async/series');
var util = require('../util');
var prompt = require('./prompt');
var initContent = require('./init-content');
var configFile = util.configFile;
var markdown = util.markdown;

function injectInFile(file, fn, cb) {
  markdown.read(file, function (error, content) {
    if (error) {
      return cb(error);
    }
    markdown.write(file, fn(content), cb);
  });
}

module.exports = function init(callback) {
  prompt(function postPrompt(result) {
    var tasks = [
      function setContentLanguage(cb) {
        initContent.setContentLanguage(result.config.projectLanguage, cb);
      },
      function writeConfig(cb) {
        configFile.writeConfig('.all-contributorsrc', result.config, cb);
      },
      function addContributorsList(cb) {
        injectInFile(result.contributorFile, initContent.addContributorsList, cb);
      },
      result.badgeFile && function addBadge(cb) {
        injectInFile(result.badgeFile, initContent.addBadge, cb);
      }
    ];
    series(_.compact(tasks), callback);
  });
};
