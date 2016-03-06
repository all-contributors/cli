'use strict';

var _ = require('lodash/fp');

function uniqueTypes(contribution) {
  return contribution.type || contribution;
}

function formatContributions(options, existing, newTypes) {
  var types = newTypes.split(',');
  if (options.url) {
    return (existing || []).concat(types.map(function (type) {
      return {type: type, url: options.url};
    }));
  }
  return _.uniqBy(uniqueTypes, (existing || []).concat(types));
}

function updateContributor(options, contributor, contributions) {
  return _.assign(contributor, {
    contributions: formatContributions(options, contributor.contributions, contributions)
  });
}

function updateExistingContributor(options, username, contributions) {
  return options.contributors.map(function (contributor) {
    if (username !== contributor.login) {
      return contributor;
    }
    return updateContributor(options, contributor, contributions);
  });
}

function addNewContributor(options, username, contributions, infoFetcher, cb) {
  infoFetcher(username, function (error, userData) {
    if (error) {
      return cb(error);
    }
    var contributor = _.assign(userData, {
      contributions: formatContributions(options, [], contributions)
    });
    return cb(null, options.contributors.concat(contributor));
  });
}

module.exports = function addContributor(options, username, contributions, infoFetcher, cb) {
  if (_.find({login: username}, options.contributors)) {
    return cb(null, updateExistingContributor(options, username, contributions));
  }
  return addNewContributor(options, username, contributions, infoFetcher, cb);
};
