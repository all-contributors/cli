'use strict';

var _ = require('lodash/fp');
var injectContentBetween = require('../markdown').injectContentBetween;

function newContent(type) {
  return '<!-- ALL-CONTRIBUTORS-' + type + ':START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-' + type + ':END -->';
}

function addBadge(lines) {
  return injectContentBetween(lines, newContent('BADGE'), 1, 1);
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
  var toInject = newContent('LIST');
  var insertionLine = findContributorsSection(lines);
  if (insertionLine === -1) {
    return lines
      .concat([
        '## Contributors',
        '',
        toInject
      ]);
  }
  return injectContentBetween(lines, toInject, insertionLine + 2, insertionLine + 2);
}

module.exports = {
  addBadge: splitAndRejoin(addBadge),
  addContributorsList: splitAndRejoin(addContributorsList)
};
