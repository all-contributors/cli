import { isCancel, multiselect, text } from '@clack/prompts';

import * as repo from '../repo/index.js';
import * as util from '../util/index.js';

function contributionOptions(options) {
  const types = util.contributionTypes(options);
  const pairs = Object.entries(types);
  const sorted = pairs.sort((a, b) => a[1].description.localeCompare(b[1].description));
  return sorted.map((pair) => ({
    label: `${pair[1].symbol}  ${pair[1].description}`,
    value: pair[0],
  }));
}

function getValidUserContributions(options, contributions) {
  const validContributionTypes = util.contributionTypes(options);
  const userContributions = contributions && contributions.split(',');

  const validUserContributions = userContributions.filter(
    (userContribution) => validContributionTypes[userContribution] !== undefined,
  );

  const invalidUserContributions = userContributions.filter(
    (userContribution) => validContributionTypes[userContribution] === undefined,
  );

  if (validUserContributions.length === 0) {
    throw new Error(`${invalidUserContributions.toString()} is/are invalid contribution type(s)`);
  }
  return validUserContributions;
}

async function promptForAnswers(options, username, contributions, defaults) {
  let promptedUsername = username;
  if (promptedUsername === undefined) {
    promptedUsername = await text({
      message: `What is the contributor's ${repo.getTypeName(options.repoType)} username?`,
      validate(inputValue) {
        if (!inputValue) {
          return 'Username is required';
        }
      },
    });
    if (isCancel(promptedUsername)) {
      return undefined;
    }
  }

  let promptedContributions = defaults.contributions;
  if (contributions === undefined) {
    const previousContributions = options.contributors
      .filter(
        (entry) => entry.login && entry.login.toLowerCase() === promptedUsername.toLowerCase(),
      )
      .reduce((allEntries, entry) => allEntries.concat(entry.contributions), []);

    promptedContributions = await multiselect({
      message: 'What are the contribution types?',
      initialValues: previousContributions,
      options: contributionOptions(options),
      required: true,
    });
    if (isCancel(promptedContributions)) {
      return undefined;
    }
  }

  return { username: promptedUsername, contributions: promptedContributions };
}

export function prompt(options, username, contributions) {
  const defaults = {
    username,
    contributions:
      contributions === undefined ? [] : getValidUserContributions(options, contributions),
  };
  if (username !== undefined && contributions !== undefined) {
    return Promise.resolve(defaults);
  }

  return promptForAnswers(options, username, contributions, defaults);
}
