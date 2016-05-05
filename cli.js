#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

var fs = require('fs');
var path = require('path');
var yargs = require('yargs');
var inquirer = require('inquirer');

var init = require('./lib/init');
var generate = require('./lib/generate');
var util = require('./lib/util');
var updateContributors = require('./lib/contributors');

var cwd = process.cwd();
var defaultRCFile = path.join(cwd, '.all-contributorsrc');

var argv = yargs
  .help('help')
  .alias('h', 'help')
  .command('generate', 'Generate the list of contributors')
  .usage('Usage: $0 generate')
  .command('add', 'add a new contributor')
  .usage('Usage: $0 add <username> <contribution>')
  .command('init', 'Prepare the project to be used with this tool')
  .usage('Usage: $0 init')
  .boolean('commit')
  .default('files', ['README.md'])
  .default('contributorsPerLine', 7)
  .default('contributors', [])
  .default('config', defaultRCFile)
  .config('config', function (configPath) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      if (configPath !== defaultRCFile) {
        console.error(error.message);
        process.exit(1);
      }
    }
  })
  .argv;

function startGeneration(argv, cb) {
  argv.files
    .map(function (file) {
      return path.join(cwd, file);
    })
    .forEach(function (file) {
      util.markdown.read(file, function (error, fileContent) {
        if (error) {
          return cb(error);
        }
        var newFileContent = generate(argv, argv.contributors, fileContent);
        util.markdown.write(file, newFileContent, cb);
      });
    });
}

function addContribution(argv, cb) {
  var username = argv._[1];
  var contributions = argv._[2];
  // Add or update contributor in the config file
  updateContributors(argv, username, contributions, function (error, data) {
    if (error) {
      return onError(error);
    }
    argv.contributors = data.contributors;
    startGeneration(argv, function (error) {
      if (error) {
        return cb(error);
      }
      if (!argv.commit) {
        return cb();
      }
      return util.git.commit(argv, data, cb);
    });
  });
}

function onError(error) {
  if (error) {
    return console.error(error);
  }
}

function promptForCommand(argv, cb) {
  try {
    fs.statSync(argv.config);
  } catch (error) { // No config file --> first time using the command
    return cb('init');
  }

  var questions = [{
    type: 'list',
    name: 'command',
    message: 'What do you want to do?',
    choices: [{
      name: 'Add a new contributor or add a new contribution type',
      value: 'add'
    }, {
      name: 'Re-generate the contributors list',
      value: 'generate'
    }],
    when: !argv._[0],
    default: 0
  }];
  inquirer.prompt(questions, function treatAnswers(answers) {
    return cb(answers.command || argv._[0]);
  });
}

promptForCommand(argv, function (command) {
  if (command === 'init') {
    init(onError);
  } else if (command === 'generate') {
    startGeneration(argv, onError);
  } else if (command === 'add') {
    addContribution(argv, onError);
  }
});
