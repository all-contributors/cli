'use strict';

var _ = require('lodash/fp');
var formatBadge = require('./formatBadge');
var formatContributor = require('./formatContributor');
var injectContentBetween = require('../markdown').injectContentBetween;

function injectBetweenTags(tag, newContent) {
  return function (previousContent) {
    var tagToLookFor = '<!-- ALL-CONTRIBUTORS-' + tag + ':';
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
    _.join('\n')
  )(contributors);
}

module.exports = function generate(options, contributors, fileContent) {
  var contributorsList = generateContributorsList(options, contributors);
  var badge = formatBadge(options, contributors);
  return _.flow(
    injectBetweenTags('LIST', '\n' + contributorsList + '\n'),
    injectBetweenTags('BADGE', badge)
  )(fileContent);
};
