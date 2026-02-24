import * as util from '../util/index.js'
import * as repo from '../repo/index.js'
import {add} from './add.js'
import {prompt} from './prompt.js'

function isNewContributor(contributorList, username) {
  return !contributorList.find(contributor => contributor.login === username)
}

export function addContributor(options, username, contributions) {
  const answersP = prompt(options, username, contributions)
  const contributorsP = answersP.then(answers =>
    add(options, answers.username, answers.contributions, repo.getUserInfo),
  )

  const writeContributorsP = contributorsP.then(contributors =>
    util.configFile.writeContributors(options.config, contributors),
  )

  return Promise.all([answersP, contributorsP, writeContributorsP]).then(
    res => {
      const answers = res[0]
      const contributors = res[1]
      return {
        username: answers.username,
        contributions: answers.contributions,
        contributors,
        newContributor: isNewContributor(
          options.contributors,
          answers.username,
        ),
      }
    },
  )
}
