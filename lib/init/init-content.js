'use strict';

var _ = require('lodash/fp');
var injectContentBetween = require('../util').markdown.injectContentBetween;
var content = require('./content.i18n.json');
var anchor = '<div id=\'contributors\'></div>';

var badgeContent = '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors)';
var listContent = '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->';
var contentObject = getContentByLang();

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

function getContentByLang(lang) {
  if (content[lang]) {
    return content[lang];
  }
  return content.EN;
}
function setContentLanguage(lang, cb) {
  contentObject = getContentByLang(lang);
  if (typeof cb === 'function') {
    cb();
  }
}

var findContributorsSection = _.findIndex(function isContributorsSection(str) {
  return (str
    .toLowerCase()
    .indexOf(contentObject.title.toLowerCase()) !== -1);
});

function addContributorsList(lines) {
  var insertionLine = findContributorsSection(lines);
  if (insertionLine === -1) {
    return lines
      .concat([
        contentObject.title + anchor,
        '',
        contentObject.header,
        '',
        listContent,
        '',
        contentObject.footer
      ]);
  }
  return injectContentBetween(lines, listContent, insertionLine + 2, insertionLine + 2);
}

module.exports = {
  addBadge: splitAndRejoin(addBadge),
  addContributorsList: splitAndRejoin(addContributorsList),
  setContentLanguage: setContentLanguage
};
