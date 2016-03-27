'use strict';

var _ = require('lodash/fp');
var inquirer = require('inquirer');
var util = require('../util');

function getQuestions(options, username, contributions) {
  return [{
    type: 'input',
    name: 'username',
    message: "What is the contributor's GitHub username?",
    when: !username
  }, {
    type: 'checkbox',
    name: 'contributions',
    message: "What are the contribution types?",
    when: !contributions,
    choices: Object.keys(util.contributionTypes(options))
  }];
}

module.exports = function prompt(options, username, contributions, cb) {
  var defaults = {
    username: username,
    contributions: contributions && contributions.split(',')
  };
  var questions = getQuestions(options, username, contributions);
  inquirer.prompt(questions, _.flow(
    _.assign(defaults),
    cb
  ));
};
