'use strict';

var _ = require('lodash/fp');
var formatBadge = require('./formatBadge');
var formatContributor = require('./formatContributor');

var injectBetweenTags = _.curry(function(tag, newContent, previousContent) {
  var lines = previousContent.split('\n');
  var openingTagIndex = _.findIndex(_.startsWith('<!-- ' + tag + ':START '), lines);
  var closingTagIndex = _.findIndex(_.startsWith('<!-- ' + tag + ':END '), lines);
  if (openingTagIndex === -1 || closingTagIndex === -1) {
    return previousContent;
  }
  return [].concat(
    lines.slice(0, openingTagIndex + 1),
    newContent,
    lines.slice(closingTagIndex)
  ).join('\n');
});

function formatLine(contributors) {
  return '| ' + contributors.join(' | ') + ' |';
}

function generateContributorsList(options, contributors) {
  return _.flow(
    _.map(function(contributor) {
      return formatContributor(options, contributor);
    }),
    _.chunk(options.contributorsPerLine),
    _.map(formatLine),
    _.join('\n'),
    function appendColumns(content) {
      var nbColumns = Math.min(options.contributorsPerLine, contributors.length);
      return content + '\n' + _.repeat(nbColumns, '| :---: ') + '|';
    }
  )(contributors);
}

module.exports = function generate(options, contributors, fileContent) {
  var contributorsList = generateContributorsList(options, contributors);
  var badge = formatBadge(options, contributors);
  return _.flow(
    injectBetweenTags('CONTRIBUTORS', contributorsList),
    injectBetweenTags('CONTRIBUTORS-BADGE', badge)
  )(fileContent);
};
