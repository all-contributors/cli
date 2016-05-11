'use strict';

var path = require('path');
var spawn = require('child_process').spawn;
var _ = require('lodash/fp');

var commitTemplate = '<%= (newContributor ? "Add" : "Update") %> @<%= username %> as a contributor';

function getRemoteOriginData(cb) {
  var output = '';
  var git = spawn('git', 'config --get remote.origin.url'.split(' '));
  git.stdout.on('data', function (data) {
    output += data;
  });

  git.stderr.on('data', cb);
  git.on('close', function () {
    cb(null, output);
  });
}

function parse(originUrl) {
  var result = /:(\w+)\/([A-Za-z0-9-_]+)/.exec(originUrl);
  if (!result) {
    return null;
  }

  return {
    projectOwner: result[1],
    projectName: result[2]
  };
}

function getRepoInfo(cb) {
  getRemoteOriginData(function (error, originUrl) {
    if (error) {
      return cb(error);
    }
    return cb(null, parse(originUrl));
  });
}

function spawnGitCommand(args, cb) {
  var git = spawn('git', args);
  git.stderr.on('data', cb);
  git.on('close', cb);
}

function commit(options, data, cb) {
  var files = options.files.concat(options.config);
  var absolutePathFiles = files.map(function (file) {
    return path.resolve(process.cwd(), file);
  });
  spawnGitCommand(['add'].concat(absolutePathFiles), function (error) {
    if (error) {
      return cb(error);
    }
    var commitMessage = _.template(options.commitTemplate || commitTemplate)(data);
    spawnGitCommand(['commit', '-m', commitMessage], cb);
  });
}

module.exports = {
  commit: commit,
  getRepoInfo: getRepoInfo
};
