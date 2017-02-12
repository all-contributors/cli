'use strict';

var _ = require('lodash/fp');

function uniqueTypes(contribution) {
  return contribution.type || contribution;
}

function formatContributions(options, existing, types) {
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

function addNewContributor(options, username, contributions, infoFetcher) {
  return infoFetcher(username)
  .then(userData => {
    var contributor = _.assign(userData, {
      contributions: formatContributions(options, [], contributions)
    });
    return options.contributors.concat(contributor);
  });
}

module.exports = function addContributor(options, username, contributions, infoFetcher) {
  if (_.find({login: username}, options.contributors)) {
    return Promise.resolve(updateExistingContributor(options, username, contributions));
  }
  return addNewContributor(options, username, contributions, infoFetcher);
};
