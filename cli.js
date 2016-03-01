#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var assign = require('lodash.assign');

var generate = require('./lib/generate');
var markdown = require('./lib/markdown');
var getUserInfo = require('./lib/github');

var cwd = process.cwd();
var defaultRCFile = path.join(cwd, '.all-contributorsrc');

var argv = require('yargs')
  .command('generate', 'Generate the list of contributors')
  .usage('Usage: $0 generate')
  .command('add', 'add a new contributor')
  .usage('Usage: $0 add <username> <contribution>')
  .demand(2)
  .default('config', defaultRCFile)
  .default('file', 'README.md')
  .default('contributorsPerLine', 7)
  .config('config', function(configPath) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      if (configPath !== defaultRCFile) {
        console.error(error.message);
        process.exit(1);
      }
    }
  })
  .help('help')
  .argv;

argv.file = path.join(cwd, argv.file);

function startGeneration(argv, cb) {
  markdown.read(argv.file, function(error, fileContent) {
    if (error) {
      return cb(error);
    }
    var newFileContent = generate(argv, argv.contributors, fileContent);
    markdown.write(argv.file, newFileContent, cb);
  });
}

function onError(error) {
  if (error) {
    return console.error(error);
  }
}

if (argv[0] === 'generate') {
  startGeneration(argv, onError);
} else if (argv[0] === 'add') {
  // Fetch user
  argv.username = argv._[1];
  argv.contributions = argv._[2].split(',');
  getUserInfo(argv.username, function(error, user) {
    if (error) {
      return console.error(error);
    }
    // TODO
    // Add him to the contributors
    // Save rc file with updated contributors key
    startGeneration(argv, onError);
  });
}
