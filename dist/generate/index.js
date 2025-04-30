"use strict";

var _ = require('lodash/fp');
var floor = require('lodash/floor');
var formatBadge = require('./format-badge');
var formatContributor = require('./format-contributor');
function injectListBetweenTags(newContent) {
  return function (previousContent) {
    var tagToLookFor = `<!-- ALL-CONTRIBUTORS-LIST:`;
    var closingTag = '-->';
    var startOfOpeningTagIndex = previousContent.indexOf(`${tagToLookFor}START`);
    var endOfOpeningTagIndex = previousContent.indexOf(closingTag, startOfOpeningTagIndex);
    var startOfClosingTagIndex = previousContent.indexOf(`${tagToLookFor}END`, endOfOpeningTagIndex);
    if (startOfOpeningTagIndex === -1 || endOfOpeningTagIndex === -1 || startOfClosingTagIndex === -1) {
      return previousContent;
    }
    var startIndent = Math.max(0, previousContent.lastIndexOf('\n', startOfOpeningTagIndex));
    var nbSpaces = startOfOpeningTagIndex - Math.min(startOfOpeningTagIndex, startIndent);
    return [previousContent.slice(0, endOfOpeningTagIndex + closingTag.length), '\n<!-- prettier-ignore-start -->', '\n<!-- markdownlint-disable -->', newContent.replace('\n', `\n${' '.repeat(nbSpaces - 1)}`), '<!-- markdownlint-restore -->', '\n<!-- prettier-ignore-end -->', '\n\n', previousContent.slice(startOfClosingTagIndex)].join('');
  };
}
function formatLine(options, contributors) {
  var width = floor(_.divide(100)(options.contributorsPerLine), 2);
  var attributes = `align="center" valign="top" width="${width}%"`;
  return `<td ${attributes}>${contributors.join(`</td>\n      <td ${attributes}>`)}</td>`;
}
function formatFooter(options) {
  if (!options.linkToUsage) {
    return '';
  }
  return `<tr>\n      <td align="center" size="13px" colspan="${options.contributorsPerLine}">\n        <img src="${'https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg'}">\n          <a href="${'https://all-contributors.js.org/docs/en/bot/usage'}">Add your contributions</a>\n        </img>\n      </td>\n    </tr>`;
}
function generateContributorsList(options, contributors) {
  var tableFooter = formatFooter(options);
  var defaultWrapperTemplate = _.template('\n<table>\n  <tbody><%= bodyContent %>  </tbody>\n<%= tableFooterContent %></table>\n\n');
  var wrapperTemplate = options.wrapperTemplate ? _.template(`\n${options.wrapperTemplate}\n\n`) : defaultWrapperTemplate;
  var seperator = options.wrapperTemplate ? '\n    </tr><br />\n    <tr>\n      ' : '\n    </tr>\n    <tr>\n      ';
  var tableFooterContent = '';
  return _.flow(_.sortBy(function (contributor) {
    if (options.contributorsSortAlphabetically) {
      return contributor.name;
    }
  }), _.map(function (contributor) {
    return formatContributor(options, contributor);
  }), _.chunk(options.contributorsPerLine), _.map(function (currentLineContributors) {
    return formatLine(options, currentLineContributors);
  }), _.join(seperator), function (newContent) {
    if (options.linkToUsage) {
      tableFooterContent = `  <tfoot>\n    ${tableFooter}\n  </tfoot>\n`;
    }
    return wrapperTemplate({
      bodyContent: `\n    <tr>\n      ${newContent}\n    </tr>\n`,
      tableFooterContent
    });
  })(contributors);
}
function replaceBadge(newContent) {
  return function (previousContent) {
    var tagToLookFor = `<!-- ALL-CONTRIBUTORS-BADGE:`;
    var closingTag = '-->';
    var startOfOpeningTagIndex = previousContent.indexOf(`${tagToLookFor}START`);
    var endOfOpeningTagIndex = previousContent.indexOf(closingTag, startOfOpeningTagIndex);
    var startOfClosingTagIndex = previousContent.indexOf(`${tagToLookFor}END`, endOfOpeningTagIndex);
    if (startOfOpeningTagIndex === -1 || endOfOpeningTagIndex === -1 || startOfClosingTagIndex === -1) {
      return previousContent;
    }
    var startIndent = Math.max(0, previousContent.lastIndexOf('\n', startOfOpeningTagIndex));
    var nbSpaces = startOfOpeningTagIndex - Math.min(startOfOpeningTagIndex, startIndent);
    return [previousContent.slice(0, endOfOpeningTagIndex + closingTag.length), '\n', newContent.replace('\n', `\n${' '.repeat(nbSpaces)}`), '\n', previousContent.slice(startOfClosingTagIndex)].join('');
  };
}
module.exports = function (options, contributors, fileContent) {
  var contributorsList = contributors.length === 0 ? '\n' : generateContributorsList(options, contributors);
  var badge = formatBadge(options, contributors);
  return _.flow(injectListBetweenTags(contributorsList), replaceBadge(badge))(fileContent);
};