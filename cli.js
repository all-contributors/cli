var options = {
  contributingFile: './fixture/some.md',
  projectOwner: 'jfmengels',
  projectName: 'all-contributors-cli',
  imageSize: 130
};

var fs = require('fs');
var path = require('path');
var request = require('request');
var findIndex = require('lodash.findindex');

function getUserInfo(username, cb) {
  request.get({
    url: 'https://api.github.com/users/' + username,
    headers: {
      'User-Agent': 'request'
    }
  }, function(error, res) {
    if (error) {
      return cb(error);
    }
    return cb(null, JSON.parse(res.body));
  });
}

function readMarkdown(filePath, cb) {
  fs.readFile(path.join(__dirname, filePath), 'utf8', cb);
}

function writeMarkdown(filePath, content, cb) {
  fs.writeFile(path.join(__dirname, filePath), content, cb);
}

function listAllContributors(start, lines) {
  var i = 0;
  while (start + i < lines.length && lines[start + i].indexOf('[![') === 0) {
    i++;
  }
  return lines.slice(start, start + i);
}

function contributorEntry(options, user) {
  return '[![' + user.name + '](' + user.avatar_url + '&s=' + options.imageSize + ')' +
    '<br />' + user.name + '](' + user.html_url + ')' +
    ' | [📖](https://github.com/' + options.projectOwner + '/' + options.projectName + '/commits?author=' + user.login + ')';
}

function addContributor(contributor, fileContent) {
  var lines = fileContent.split('\n');
  var contributorListStart = findIndex(lines, function(line) {
    return line.indexOf(':---: | :---:') !== -1;
  });
  var contributors = [].concat(
    listAllContributors(contributorListStart + 1, lines),
    contributor
  );

  return [].concat(
    lines.slice(0, contributorListStart + 1),
    contributors,
    lines.slice(contributorListStart + contributors.length)
  ).join('\n')
}

getUserInfo('jfmengels', function(error, user) {
  if (error) {
    return console.error(error);
  }
  readMarkdown(options.contributingFile, function(error, fileContent) {
    if (error) {
      return console.error(error);
    }
    var newFileContent = addContributor(contributorEntry(options, user), fileContent);
    writeMarkdown(options.contributingFile, newFileContent, function(error, fileContent) {
      if (error) {
        return console.error(error);
      }
    });
  });
});
