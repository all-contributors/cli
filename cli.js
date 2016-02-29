#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var assign = require('lodash.assign');

var markdown = require('./lib/markdown');
var getUserInfo = require('./lib/github');
var defaultEmojis = require('./lib/emoji');
var addContributor = require('./lib/addContributor');

var cwd = process.cwd();
var defaultRCFile = path.join(cwd, '.all-contributorsrc');

var argv = require('yargs')
  .command('add', 'add a new contributor')
  .usage('Usage: $0 add <username> <contribution>')
  .demand(2)
  .default('config', defaultRCFile)
  .default('file', 'README.md')
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
  .default('emoji', {})
  .pkgConf('all-contributors')
  .argv;

argv.emoji = assign({}, defaultEmojis, argv.emoji);
argv.username = argv._[1];
argv.contributions = argv._[2].split(',');
argv.file = path.join(cwd, argv.file);

getUserInfo(argv.username, function(error, user) {
  if (error) {
    return console.error(error);
  }
  markdown.read(argv.file, function(error, fileContent) {
    if (error) {
      return console.error(error);
    }
    var newFileContent = addContributor(argv, user, fileContent);
    markdown.write(argv.file, newFileContent, function(error, fileContent) {
      if (error) {
        return console.error(error);
      }
    });
  });
});
