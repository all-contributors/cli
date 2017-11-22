'use strict';

var path = require('path');
var spawn = require('child_process').spawn;
var _ = require('lodash/fp');
var pify = require('pify');

var commitTemplate = '<%= (newContributor ? "Add" : "Update") %> @<%= username %> as a contributor';

var getRemoteOriginData = pify(cb => {
  var output = '';
  var git = spawn('git', 'config --get remote.origin.url'.split(' '));
  git.stdout.on('data', function (data) {
    output += data;
  });

  git.stderr.on('data', cb);
  git.on('close', function () {
    cb(null, output);
  });
});

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

function getRepoInfo() {
  return getRemoteOriginData()
    .then(parse);
}

var spawnGitCommand = pify((args, cb) => {
  var git = spawn('git', args);
  git.stderr.on('data', cb);
  git.on('close', cb);
});

function commit(options, data) {
  var files = options.files.concat(options.config);
  var absolutePathFiles = files.map(file => {
    return path.resolve(process.cwd(), file);
  });
  return spawnGitCommand(['add'].concat(absolutePathFiles))
    .then(() => {
      var commitMessage = _.template(options.commitTemplate || commitTemplate)(data);
      return spawnGitCommand(['commit', '-m', commitMessage]);
    });
}

module.exports = {
  commit: commit,
  getRepoInfo: getRepoInfo
};
