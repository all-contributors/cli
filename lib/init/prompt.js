'use strict';

var _ = require('lodash/fp');
var inquirer = require('inquirer');
var git = require('../util').git;

var questions = [{
  type: 'input',
  name: 'projectName',
  message: 'What\'s the name of the repository?'
}, {
  type: 'input',
  name: 'projectOwner',
  message: 'Who is the owner of the repository?'
}, {
  type: 'list',
  name: 'projectLanguage',
  message: 'What language are you using for the list?',
  choices: [{
    name: 'English (default)',
    value: 'EN'
  }, {
    name: 'Spanish',
    value: 'ES'
  }],
  default: 'EN'
}, {
  type: 'input',
  name: 'contributorFile',
  message: 'In which file should contributors be listed?',
  default: 'README.md'
}, {
  type: 'confirm',
  name: 'needBadge',
  message: 'Do you want a badge tallying the number of contributors?'
}, {
  type: 'input',
  name: 'badgeFile',
  message: 'In which file should the badge be shown?',
  when: function (answers) {
    return answers.needBadge;
  },
  default: function (answers) {
    return answers.contributorFile;
  }
}, {
  type: 'input',
  name: 'imageSize',
  message: 'How big should the avatars be? (in px)',
  filter: parseInt,
  default: 100
}, {
  type: 'confirm',
  name: 'commit',
  message: 'Do you want this badge to auto-commit when contributors are added?',
  default: true
}];

var uniqueFiles = _.flow(
  _.compact,
  _.uniq
);

module.exports = function prompt(cb) {
  git.getRepoInfo(function (error, repoInfo) {
    if (error) {
      return cb(error);
    }
    if (repoInfo) {
      questions[0].default = repoInfo.projectName;
      questions[1].default = repoInfo.projectOwner;
    }
    inquirer.prompt(questions, function treatAnswers(answers) {
      var config = {
        projectName: answers.projectName,
        projectOwner: answers.projectOwner,
        projectLanguage: answers.projectLanguage,
        files: uniqueFiles([answers.contributorFile, answers.badgeFile]),
        imageSize: answers.imageSize,
        commit: answers.commit,
        contributors: []
      };
      return cb({
        config: config,
        contributorFile: answers.contributorFile,
        badgeFile: answers.badgeFile
      });
    });
  });
};
