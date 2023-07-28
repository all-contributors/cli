#!/usr/bin/env node
/* eslint-disable no-console */

const path = require('path')
const yargs = require('yargs')
const chalk = require('chalk')
const inquirer = require('inquirer')
const didYouMean = require('didyoumean')
const {info, warn, use} = require('nclr')

const init = require('./init')
const generate = require('./generate')
const util = require('./util')
const repo = require('./repo')
const updateContributors = require('./contributors')
const {getContributors} = require('./discover')
const {getLearner} = require('./discover/learner')

const cwd = process.cwd()
const defaultRCFile = path.join(cwd, '.all-contributorsrc')

const yargv = yargs
  .scriptName('all-contributors')
  .help('help')
  .alias('h', 'help')
  .alias('v', 'version')
  .version()
  .recommendCommands()
  .command(
    'generate',
    `Generate the list of contributors\n\nUSAGE: all-contributors generate`,
  )
  .command(
    'add',
    `Add a new contributor\n\nUSAGE: all-contributors add <username> <comma-separated contributions>`,
  )
  .command(
    'init',
    `Prepare the project to be used with this tool\n\nUSAGE: all-contributors init`,
  )
  .command(
    'check',
    `Compare contributors from the repository with the ones credited in .all-contributorsrc'\n\nUSAGE: all-contributors check`,
  )
  .boolean('commit')
  .default('files', ['README.md'])
  .default('contributorsPerLine', 7)
  .option('contributorsSortAlphabetically', {
    type: 'boolean',
    default: false,
    description:
      'Sort the list of contributors alphabetically in the generated list',
  })
  .default('contributors', [])
  .default('config', defaultRCFile)
  .config('config', configPath => {
    try {
      return util.configFile.readConfig(configPath)
    } catch (error) {
      if (error instanceof SyntaxError || configPath !== defaultRCFile) {
        onError(error)
      }
    }
  }).argv

function onError(error) {
  if (error) {
    console.error(error.message)
    process.exit(1)
  }
  process.exit(0)
}

function suggestCommands(cmd) {
  const availableCommands = ['generate', 'add', 'init', 'check']
  const suggestion = didYouMean(cmd, availableCommands)

  if (suggestion) console.log(chalk.bold(`Did you mean ${suggestion}`))
}

function startGeneration(argv) {
  return Promise.all(
    argv.files.map(file => {
      const filePath = path.join(cwd, file)

      return util.markdown.read(filePath).then(fileContent => {
        const newFileContent = generate(argv, argv.contributors, fileContent)
        return util.markdown.write(filePath, newFileContent)
      })
    }),
  )
}

async function addContribution(argv) {
  util.configFile.readConfig(argv.config) // ensure the config file exists
  const username = argv._[1] === undefined ? undefined : String(argv._[1])
  const contributions = argv._[2]

  // Add or update contributor in the config file
  let data

  try {
    data = await updateContributors(argv, username, contributions)
  } catch (error) {
    return console.error('Contributor Update fail:', error)
  }

  argv.contributors = data.contributors
  /* Example
   [ { login: 'Berkmann18',
   name: 'Maximilian Berkmann',
   avatar_url: 'https://avatars0.githubusercontent.com/u/8260834?v=4',
   profile: 'http://maxcubing.wordpress.com',
   contributions: [ 'code', 'ideas' ] },
   { already in argv.contributors } ]
  */

  try {
    await startGeneration(argv)

    return argv.commit ? util.git.commit(argv, data) : null
  } catch (error) {
    console.error('Generation fail:', error)
  }
}

async function checkContributors(argv) {
  const configData = util.configFile.readConfig(argv.config)

  const repoContributors = await repo.getContributors(
    configData.projectOwner,
    configData.projectName,
    configData.repoType,
    configData.repoHost,
  )

  const checkKey = repo.getCheckKey(configData.repoType)
  const knownContributions = configData.contributors.reduce((obj, item) => {
    obj[item[checkKey]] = item.contributions
    return obj
  }, {})
  const knownContributors = configData.contributors.map(
    contributor => contributor[checkKey],
  )

  const missingInConfig = repoContributors.filter(
    key => !knownContributors.includes(key),
  )
  const missingFromRepo = knownContributors.filter(key => {
    return (
      !repoContributors.includes(key) &&
      (knownContributions[key].includes('code') ||
        knownContributions[key].includes('test'))
    )
  })

  if (missingInConfig.length) {
    process.stdout.write(
      chalk.bold('Missing contributors in .all-contributorsrc:\n'),
    )
    process.stdout.write(`    ${missingInConfig.join(', ')}\n`)
  }

  if (missingFromRepo.length) {
    process.stdout.write(
      chalk.bold('Unknown contributors found in .all-contributorsrc:\n'),
    )
    process.stdout.write(`${missingFromRepo.join(', ')}\n`)
  }
}

async function fetchContributors(argv) {
  const {
    reviewers,
    commitAuthors,
    issueCreators,
    prCreators,
  } = await getContributors(argv.projectOwner, argv.projectName, true)
  const args = {...argv, _: []}
  const contributorsToAdd = []
  const learner = await getLearner()

  reviewers.forEach(usr => {
    contributorsToAdd.push({login: usr.login, contributions: ['review']})

    console.log(
      `Including ${chalk.underline('Reviewer')} ${use('info', usr.login)}`,
    )
  })

  const guessCategories = (item, itemType, contributor) => {
    const guessedCategory = learner
      .classify(item)
      .find(ctr => ctr && ctr !== 'null' && ctr !== 'undefined')

    if (!guessedCategory) {
      warn(
        `Oops, I couldn't find any category for the "${use(
          'inp',
          item,
        )}" ${itemType}`,
      )

      return
    }

    if (!contributor.contributions.includes(guessedCategory)) {
      contributor.contributions.push(guessedCategory)

      console.log(
        `Including ${use('info', contributor.login)} for ${chalk.underline(
          guessedCategory,
        )}, based on "${use('inp', item)}"`,
      )
    }
  }

  info('Looking at issue creators')
  issueCreators.forEach(usr => {
    const contributor = {
      login: usr.login,
      contributions: [],
    }

    usr.labels.forEach(label => guessCategories(label, 'label', contributor))
    usr.titles.forEach(title => guessCategories(title, 'title', contributor))

    const existingContributor = contributorsToAdd.find(
      ctr => ctr.login === usr.login,
    )

    if (existingContributor) {
      existingContributor.contributions.push(...contributor.contributions)
    } else {
      contributorsToAdd.push(contributor)
    }
  })

  info('Looking at PR creators')
  prCreators.forEach(usr => {
    const contributor = {
      login: usr.login,
      contributions: [],
    }

    usr.labels.forEach(label => guessCategories(label, 'PR label', contributor))
    usr.titles.forEach(title => guessCategories(title, 'PR title', contributor))

    const existingContributor = contributorsToAdd.find(
      ctr => ctr.login === usr.login,
    )

    if (existingContributor) {
      existingContributor.contributions.push(...contributor.contributions)
    } else {
      contributorsToAdd.push(contributor)
    }
  })

  info('Looking at commit authors')
  commitAuthors.forEach(usr => {
    const existingContributor = contributorsToAdd.find(
      ctr => ctr.login === usr.login,
    )

    if (existingContributor) {
      // TODO: See how the commit message could be added (this may require the full output) to not just assume it's a code contribution
      if (!existingContributor.contributions.includes('code')) {
        existingContributor.contributions.push('code')
      }
    } else {
      contributorsToAdd.push({login: usr.login, contributions: ['code']})
    }
  })
  // TODO: Roll onto other contribution categories following https://www.draw.io/#G1uL9saIuZl3rj8sOo9xsLOPByAe28qhwa

  info('Finalising')
  for (const contributor of contributorsToAdd) {
    const isDependabotDuplicates = /dependabot(\[bot\]|-\w+)/.test(
      contributor.login,
    )
    if (!contributor.contributions.length || isDependabotDuplicates) {
      console.log('Skipping', contributor.login)

      continue
    }

    // Format contributor contributions
    const contributions = contributor.contributions.join('/')

    console.log(
      `Adding ${use('info', contributor.login)} for ${chalk.underline(
        contributions,
      )}`,
    )

    args._ = ['', contributor.login, contributor.contributions.join(',')]

    try {
      /* eslint-disable no-await-in-loop */
      await addContribution(args)
    } catch (error) {
      console.error(
        `Adding ${use('info', contributor.login)} for ${chalk.underline(
          contributions,
        )} Failed: ${JSON.stringify(error)}`,
      )
    }
  }
}

async function promptForCommand(argv) {
  const questions = [
    {
      type: 'list',
      name: 'command',
      message: 'What do you want to do?',
      choices: [
        {
          name: 'Add new contributor or edit contribution type',
          value: 'add',
        },
        {
          name: 'Re-generate the contributors list',
          value: 'generate',
        },
        {
          name:
            'Compare contributors from the repository with the credited ones',
          value: 'check',
        },
        {
          name: 'Fetch contributors from the repository',
          value: 'fetch',
        },
      ],
      when: !argv._[0],
      default: 0,
    },
  ]

  const answers = await inquirer.prompt(questions)

  return answers.command || argv._[0]
}

promptForCommand(yargv)
  .then(command => {
    switch (command) {
      case 'init':
        return init()
      case 'generate':
        return startGeneration(yargv)
      case 'add':
        return addContribution(yargv)
      case 'check':
        return checkContributors(yargv)
      case 'fetch':
        return fetchContributors(yargv)
      default:
        suggestCommands(command)
        throw new Error(`Unknown command ${command}`)
    }
  })
  .catch(onError)
