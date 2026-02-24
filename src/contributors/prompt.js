import inquirer from 'inquirer'
import * as util from '../util/index.js'
import * as repo from '../repo/index.js'

function contributionChoices(options) {
  const types = util.contributionTypes(options)
  const pairs = Object.entries(types)
  const sorted = pairs.sort((a, b) =>
    a[1].description.localeCompare(b[1].description),
  )
  return sorted.map(pair => ({
    name: `${pair[1].symbol}  ${pair[1].description}`,
    value: pair[0],
  }))
}

function getQuestions(options, username, contributions) {
  return [
    {
      type: 'input',
      name: 'username',
      message: `What is the contributor's ${repo.getTypeName(
        options.repoType,
      )} username?`,
      when: !username,
      validate: function validate(input) {
        if (!input) {
          return 'Username not provided'
        }
        return true
      },
    },
    {
      type: 'checkbox',
      name: 'contributions',
      message: 'What are the contribution types?',
      when: !contributions,
      default: function (answers) {
        // default values for contributions when updating existing users
        answers.username = answers.username || username
        return options.contributors
          .filter(
            entry =>
              entry.login &&
              entry.login.toLowerCase() === answers.username.toLowerCase(),
          )
          .reduce(
            (allEntries, entry) => allEntries.concat(entry.contributions),
            [],
          )
      },
      choices: contributionChoices(options),
      validate: function (input, answers) {
        answers.username = answers.username || username
        const previousContributions = options.contributors
          .filter(
            entry =>
              entry.login &&
              entry.login.toLowerCase() === answers.username.toLowerCase(),
          )
          .reduce(
            (allEntries, entry) => allEntries.concat(entry.contributions),
            [],
          )

        if (!input.length) {
          return 'Use space to select at least one contribution type.'
        } else if (
          JSON.stringify(input.sort()) ===
          JSON.stringify(previousContributions.sort())
        ) {
          return 'Nothing changed, use space to select contribution types.'
        }
        return true
      },
    },
  ]
}

function getValidUserContributions(options, contributions) {
  const validContributionTypes = util.contributionTypes(options)
  const userContributions = contributions && contributions.split(',')

  const validUserContributions = userContributions.filter(
    userContribution => validContributionTypes[userContribution] !== undefined,
  )

  const invalidUserContributions = userContributions.filter(
    userContribution => validContributionTypes[userContribution] === undefined,
  )

  if (validUserContributions.length === 0) {
    throw new Error(
      `${invalidUserContributions.toString()} is/are invalid contribution type(s)`,
    )
  }
  return validUserContributions
}

export function prompt(options, username, contributions) {
  const defaults = {
    username,
    contributions:
      username === undefined && contributions === undefined
        ? []
        : getValidUserContributions(options, contributions),
  }
  const questions = getQuestions(options, username, contributions)
  return inquirer.prompt(questions).then(answers => ({...defaults, ...answers}))
}
