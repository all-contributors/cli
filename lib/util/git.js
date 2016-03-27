'use strict';

var spawn = require('child_process').spawn;

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
  var result = /\:(\w+)\/([A-Za-z0-9-_]+)/.exec(originUrl);
  return {
    projectOwner: result[1],
    projectName: result[2]
  };
}

module.exports = function getRepoInfo(cb) {
  getRemoteOriginData(function (error, originUrl) {
    if (error) {
      return cb(error);
    }
    return cb(null, parse(originUrl));
  });
};
