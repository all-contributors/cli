'use strict';

var _ = require('lodash/fp');
var util = require('../util');

var linkTemplate = _.template('[<%= symbol %>](<%= url %>)');

function getType(options, contribution) {
  var types = util.contributionTypes(options);
  return types[contribution.type || contribution];
}

module.exports = function formatContribution(options, contributor, contribution) {
  var type = getType(options, contribution);
  var templateData = {
    symbol: type.symbol,
    contributor: contributor,
    options: options
  };
  if (contribution.url) {
    return linkTemplate(_.assign({url: contribution.url}, templateData));
  }
  if (type.link) {
    var url = _.template(type.link)(templateData);
    return linkTemplate(_.assign({url: url}, templateData));
  }
  return type.symbol;
};
