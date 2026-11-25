import * as repo from '../repo/index.js';
import * as util from '../util/index.js';
import { add } from './add.js';
import { prompt } from './prompt.js';

function isNewContributor(contributorList, username) {
  return !contributorList.find((contributor) => contributor.login === username);
}

export async function addContributor(options, username, contributions) {
  const answers = await prompt(options, username, contributions);
  if (answers === undefined) {
    return undefined;
  }

  const contributors = await add(
    options,
    answers.username,
    answers.contributions,
    repo.getUserInfo,
  );

  await util.configFile.writeContributors(options.config, contributors);

  return {
    username: answers.username,
    contributions: answers.contributions,
    contributors,
    newContributor: isNewContributor(options.contributors, answers.username),
  };
}
