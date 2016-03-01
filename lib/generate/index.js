'use strict';

var _ = require('lodash/fp');
var formatContributor = require('./formatContributor');

function injectBetweenTags(fileContent, newContent) {
  var lines = fileContent.split('\n');
  var openingTagIndex = _.findIndex(_.startsWith('<!-- CONTRIBUTORS:START'), lines);
  var closingTagIndex = _.findIndex(_.startsWith('<!-- CONTRIBUTORS:END'), lines);
  return [].concat(
    lines.slice(0, openingTagIndex + 1),
    newContent,
    lines.slice(closingTagIndex)
  ).join('\n');
}

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
  return _.flow(
    generateContributorsList,
    _.partial(injectBetweenTags, [fileContent])
  )(options, contributors);
};
