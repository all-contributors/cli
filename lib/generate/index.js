'use strict';

var _ = require('lodash/fp');
var formatBadge = require('./formatBadge');
var formatContributor = require('./formatContributor');

function injectContentBetween(lines, content, startIndex, endIndex) {
  return [].concat(
    lines.slice(0, startIndex),
    content,
    lines.slice(endIndex)
  );
}

var injectBetweenTags = _.curry(function(tag, newContent, previousContent) {
  var lines = previousContent.split('\n');
  var openingTagIndex = _.findIndex(_.startsWith('<!-- ALL-CONTRIBUTORS-' + tag + ':START '), lines);
  var closingTagIndex = _.findIndex(_.startsWith('<!-- ALL-CONTRIBUTORS-' + tag + ':END '), lines);
  if (openingTagIndex === -1 || closingTagIndex === -1) {
    return previousContent;
  }
  return injectContentBetween(lines, newContent, openingTagIndex + 1, closingTagIndex)
    .join('\n');
});

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
    injectBetweenTags('LIST', contributorsList),
    injectBetweenTags('BADGE', badge)
  )(fileContent);
};
