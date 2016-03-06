'use strict';

var fs = require('fs');

function read(filePath, cb) {
  fs.readFile(filePath, 'utf8', cb);
}

function write(filePath, content, cb) {
  fs.writeFile(filePath, content, cb);
}

module.exports = {
  read: read,
  write: write
};
