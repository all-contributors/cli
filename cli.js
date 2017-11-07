#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

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
      return util.configFile.readConfig(configPath);
    } catch (error) {
      if (configPath !== defaultRCFile) {
        onError(error);
      }
    }
  })
  .argv;

function startGeneration(argv) {
  return Promise.all(
    argv.files.map(file => {
      const filePath = path.join(cwd, file);
      return util.markdown.read(filePath)
      .then(fileContent => {
        var newFileContent = generate(argv, argv.contributors, fileContent);
        return util.markdown.write(filePath, newFileContent);
      });
    })
  );
}

function addContribution(argv) {
  var username = argv._[1];
  var contributions = argv._[2];
  // Add or update contributor in the config file
  return updateContributors(argv, username, contributions)
  .then(data => {
    argv.contributors = data.contributors;
    return startGeneration(argv)
    .then(() => {
      if (argv.commit) {
        return util.git.commit(argv, data);
      }
    });
  });
}

function onError(error) {
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  process.exit(0);
}

function promptForCommand(argv) {
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

  return inquirer.prompt(questions)
  .then(answers => {
    return answers.command || argv._[0];
  });
}

promptForCommand(argv)
  .then(command => {
    switch (command) {
      case 'init':
        return init();
      case 'generate':
        return startGeneration(argv);
      case 'add':
        return addContribution(argv);
      default:
        throw new Error(`Unknown command ${command}`);
    }
  })
  .catch(onError);
