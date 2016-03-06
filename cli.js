#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

var fs = require('fs');
var path = require('path');

var generate = require('./lib/generate');
var markdown = require('./lib/markdown');
var updateContributors = require('./lib/contributors');

var cwd = process.cwd();
var defaultRCFile = path.join(cwd, '.all-contributorsrc');

var argv = require('yargs')
  .help('help')
  .alias('h', 'help')
  .command('generate', 'Generate the list of contributors')
  .usage('Usage: $0 generate')
  .command('add', 'add a new contributor')
  .usage('Usage: $0 add <username> <contribution>')
  .demand(2)
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
      markdown.read(file, function (error, fileContent) {
        if (error) {
          return cb(error);
        }
        var newFileContent = generate(argv, argv.contributors, fileContent);
        markdown.write(file, newFileContent, cb);
      });
    });
}

function onError(error) {
  if (error) {
    return console.error(error);
  }
}

var command = argv._[0];

if (command === 'generate') {
  startGeneration(argv, onError);
} else if (command === 'add') {
  var username = argv._[1];
  var contributions = argv._[2];
  // Add or update contributor in the config file
  updateContributors(argv, username, contributions, function (error, contributors) {
    if (error) {
      return onError(error);
    }
    argv.contributors = contributors;
    startGeneration(argv, onError);
  });
}
