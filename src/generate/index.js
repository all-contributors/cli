'use strict';

var _ = require('lodash/fp');
var injectContentBetween = require('../util').markdown.injectContentBetween;
var formatBadge = require('./format-badge');
var formatContributor = require('./format-contributor');

var badgeRegex = /\[!\[All Contributors\]\([a-zA-Z0-9\-\.\/_:\?=]+\)\]\(#\w+\)/;

function injectListBetweenTags(newContent) {
  return function (previousContent) {
    var tagToLookFor = '<!-- ALL-CONTRIBUTORS-LIST:';
    var closingTag = '-->';
    var startOfOpeningTagIndex = previousContent.indexOf(tagToLookFor + 'START');
    var endOfOpeningTagIndex = previousContent.indexOf(closingTag, startOfOpeningTagIndex);
    var startOfClosingTagIndex = previousContent.indexOf(tagToLookFor + 'END', endOfOpeningTagIndex);
    if (startOfOpeningTagIndex === -1 || endOfOpeningTagIndex === -1 || startOfClosingTagIndex === -1) {
      return previousContent;
    }
    return previousContent.slice(0, endOfOpeningTagIndex + closingTag.length) +
      newContent +
      previousContent.slice(startOfClosingTagIndex);
  };
}

function formatLine(contributors) {
  return '| ' + contributors.join(' | ') + ' |';
}

function createColumnLine(options, contributors) {
  var nbColumns = Math.min(options.contributorsPerLine, contributors.length);
  return _.repeat(nbColumns, '| :---: ') + '|';
}

function generateContributorsList(options, contributors) {
  return _.flow(
    _.map(function formatEveryContributor(contributor) {
      return formatContributor(options, contributor);
    }),
    _.chunk(options.contributorsPerLine),
    _.map(formatLine),
    function insertColumns(lines) {
      var columnLine = createColumnLine(options, contributors);
      return injectContentBetween(lines, columnLine, 1, 1);
    },
    _.join('\n'),
    function (newContent) {
      return '\n' + newContent + '\n';
    }
  )(contributors);
}

function replaceBadge(newContent) {
  return function (previousContent) {
    var regexResult = badgeRegex.exec(previousContent);
    if (!regexResult) {
      return previousContent;
    }
    return previousContent.slice(0, regexResult.index) +
      newContent +
      previousContent.slice(regexResult.index + regexResult[0].length);
  };
}

module.exports = function generate(options, contributors, fileContent) {
  var contributorsList = contributors.length === 0 ? '\n' : generateContributorsList(options, contributors);
  var badge = formatBadge(options, contributors);
  return _.flow(
    injectListBetweenTags(contributorsList),
    replaceBadge(badge)
  )(fileContent);
};
