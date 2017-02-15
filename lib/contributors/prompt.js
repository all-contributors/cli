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
    choices: contributionChoices(options)
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
