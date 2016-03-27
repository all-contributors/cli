'use strict';

var fs = require('fs');

function read(filePath, cb) {
  fs.readFile(filePath, 'utf8', cb);
}

function write(filePath, content, cb) {
  fs.writeFile(filePath, content, cb);
}

function injectContentBetween(lines, content, startIndex, endIndex) {
  return [].concat(
    lines.slice(0, startIndex),
    content,
    lines.slice(endIndex)
  );
}

module.exports = {
  read: read,
  write: write,
  injectContentBetween: injectContentBetween
};
