'use strict';

var _ = require('lodash/fp');
var inquirer = require('inquirer');
var util = require('../util');

var contributionChoices = _.flow(
  util.contributionTypes,
  _.toPairs,
  _.sortBy(function (pair) {
    return pair[1].description;
  }),
  _.map(function (pair) {
    return {
      name: pair[1].symbol + '  ' + pair[1].description,
      value: pair[0]
    };
  })
);

function getQuestions(options, username, contributions) {
  return [{
    type: 'input',
    name: 'username',
    message: 'What is the contributor\'s GitHub username?',
    when: !username
  }, {
    type: 'checkbox',
    name: 'contributions',
    message: 'What are the contribution types?',
    when: !contributions,
    default: function (answers) {
      // default values for contributions when updating existing users
      answers.username = answers.username || username;
      return options.contributors
        .filter((entry) => entry.login.toLowerCase() === answers.username.toLowerCase())
        .reduce((memo, entry) => memo.concat(entry.contributions), []);
    },
    choices: contributionChoices(options),
    validate: function (input, answers) {
      answers.username = answers.username || username;
      var previousContributions = options.contributors
        .filter((entry) => entry.login.toLowerCase() === answers.username.toLowerCase())
        .reduce((memo, entry) => memo.concat(entry.contributions), []);

      if (!input.length) {
        return 'Use space to select at least one contribution type.'
      } else if (_.isEqual(input, previousContributions)) {
        return 'Nothing changed, use space to select contribution types.'
      }
      return true;
    }
  }];
}

module.exports = function prompt(options, username, contributions) {
  var defaults = {
    username: username,
    contributions: contributions && contributions.split(',')
  };
  var questions = getQuestions(options, username, contributions);
  return inquirer.prompt(questions)
    .then(_.assign(defaults));
};
