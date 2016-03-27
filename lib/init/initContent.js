'use strict';

var _ = require('lodash/fp');
var injectContentBetween = require('../util').markdown.injectContentBetween;

var badgeContent = '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors)';
var listContent = '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->';

function addBadge(lines) {
  return injectContentBetween(lines, badgeContent, 1, 1);
}

function splitAndRejoin(fn) {
  return _.flow(
    _.split('\n'),
    fn,
    _.join('\n')
  );
}

var findContributorsSection = _.findIndex(function isContributorsSection(str) {
  return str
    .toLowerCase()
    .indexOf('# contributors') === 1;
});

function addContributorsList(lines) {
  var insertionLine = findContributorsSection(lines);
  if (insertionLine === -1) {
    return lines
      .concat([
        '## Contributors',
        '',
        listContent
      ]);
  }
  return injectContentBetween(lines, listContent, insertionLine + 2, insertionLine + 2);
}

module.exports = {
  addBadge: splitAndRejoin(addBadge),
  addContributorsList: splitAndRejoin(addContributorsList)
};
