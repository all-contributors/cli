'use strict';

var _ = require('lodash/fp');
var util = require('../util');

var linkTemplate = _.template('[<%= symbol %>](<%= url %> "<%= description %>")');

function getType(options, contribution) {
  var types = util.contributionTypes(options);
  return types[contribution.type || contribution];
}

module.exports = function formatContribution(options, contributor, contribution) {
  var type = getType(options, contribution);

  if (!type) {
    throw new Error('Unknown contribution type ' + contribution + ' for contributor ' + contributor.login);
  }

  var templateData = {
    symbol: type.symbol,
    description: type.description,
    contributor: contributor,
    options: options
  };

  var url = `#${contribution}-${contributor.login}`;
  if (contribution.url) {
    url = contribution.url;
  } else if (type.link) {
    url = _.template(type.link)(templateData);
  }

  return linkTemplate(_.assign({url: url}, templateData));
};
