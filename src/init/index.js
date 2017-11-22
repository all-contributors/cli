'use strict';

var util = require('../util');
var prompt = require('./prompt');
var initContent = require('./init-content');
var configFile = util.configFile;
var markdown = util.markdown;

function injectInFile(file, fn) {
  return markdown.read(file)
  .then(content => markdown.write(file, fn(content)));
}

module.exports = function init() {
  return prompt()
    .then(result => {
      return configFile.writeConfig('.all-contributorsrc', result.config)
      .then(() => injectInFile(result.contributorFile, initContent.addContributorsList))
      .then(() => {
        if (result.badgeFile) {
          return injectInFile(result.badgeFile, initContent.addBadge);
        }
      });
    });
};
