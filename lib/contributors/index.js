'use strict';

var _ = require('lodash/fp');
var util = require('../util');
var add = require('./add');
var github = require('./github');
var prompt = require('./prompt');

function isNewContributor(contributorList, username) {
  return !_.find({login: username}, contributorList);
}

module.exports = function addContributor(options, username, contributions) {
  const answersP = prompt(options, username, contributions);
  const contributorsP = answersP
    .then(answers => add(options, answers.username, answers.contributions, github));

  const writeContributorsP = contributorsP.then(
    contributors => util.configFile.writeContributors(options.config, contributors)
  );

  return Promise.all([answersP, contributorsP, writeContributorsP])
  .then(res => {
    const answers = res[0];
    const contributors = res[1];
    return {
      username: answers.username,
      contributions: answers.contributions,
      contributors: contributors,
      newContributor: isNewContributor(options.contributors, answers.username)
    };
  });
};
