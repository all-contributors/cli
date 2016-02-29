#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var assign = require('lodash.assign');

var markdown = require('./lib/markdown');
var getUserInfo = require('./lib/github');
var defaultEmojis = require('./lib/emoji');
var addContributor = require('./lib/addContributor');

var defaultRCFile = '.all-contributorsrc';

var argv = require('yargs')
  .usage('Usage: $0 <username> <contribution>')
  .demand(2)
  .default('config', defaultRCFile)
  .default('file', 'README.md')
  .config('config', function(configPath) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      if (configPath !== path.join(__dirname, defaultRCFile)) {
        console.error(error.message);
        process.exit(1);
      }
    }
  })
  .default('emoji', {})
  .pkgConf('all-contributors')
  .argv;

argv.emoji = assign({}, defaultEmojis, argv.emoji);
argv.username = argv._[0];
argv.contributions = argv._[1].split(',');
argv.file = path.join(__dirname, argv.file);

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
