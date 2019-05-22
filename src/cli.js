#!/usr/bin/env node
/* eslint-disable no-console */

const path = require('path')
const yargs = require('yargs')
const chalk = require('chalk')
const inquirer = require('inquirer')
const didYouMean = require('didyoumean')

// Setting edit length to be 60% of the input string's length
didYouMean.threshold = 0.6

const init = require('./init')
const generate = require('./generate')
const util = require('./util')
const repo = require('./repo')
const updateContributors = require('./contributors')
const {getContributors} = require('./discover')
const learner = require('./discover/learner')

const cwd = process.cwd()
const defaultRCFile = path.join(cwd, '.all-contributorsrc')

const yargv = yargs
  .help('help')
  .alias('h', 'help')
  .alias('v', 'version')
  .version()
  .command('generate', 'Generate the list of contributors')
  .usage('Usage: $0 generate')
  .command('add', 'add a new contributor')
  .usage('Usage: $0 add <username> <contribution>')
  .command('init', 'Prepare the project to be used with this tool')
  .usage('Usage: $0 init')
  .command(
    'check',
    'Compares contributors from the repository with the ones credited in .all-contributorsrc',
  )
  .usage('Usage: $0 check')
  .boolean('commit')
  .default('files', ['README.md'])
  .default('contributorsPerLine', 7)
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

function suggestCommands(cmd) {
  const availableCommands = ['generate', 'add', 'init', 'check']
  const suggestion = didYouMean(cmd, availableCommands)

  if (suggestion) {
    console.log(chalk.bold(`Did you mean ${suggestion}`))
  }
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

function addContribution(argv) {
  // console.log('argv=', argv);
  /* Example:
  {
    _: [ 'add' ],
    projectName: 'cz-cli',
    projectOwner: 'commitizen',
    repoType: 'github',
    repoHost: 'https://github.com',
    files: [ 'AC.md' ],
    imageSize: 100,
    commit: false,
    commitConvention: 'angular',
    contributors: [],
    contributorsPerLine: 7,
    'contributors-per-line': 7,
    config: '/mnt/c/Users/max/Projects/cz-cli/.all-contributorsrc',
    '$0': '../all-contributors-cli/src/cli.js'
}
  */
  const username = argv._[1]
  const contributions = argv._[2]
  // console.log('username=', username, 'contributions=', contributions)
  // Add or update contributor in the config file
  return updateContributors(argv, username, contributions).then(
    data => {
      argv.contributors = data.contributors
      // console.log('argv contributors=', argv.contributors)
      /* Example
     [ { login: 'Berkmann18',
     name: 'Maximilian Berkmann',
     avatar_url: 'https://avatars0.githubusercontent.com/u/8260834?v=4',
     profile: 'http://maxcubing.wordpress.com',
     contributions: [ 'code', 'ideas' ] },
     { already in argv.contributors } ]
    */
      return startGeneration(argv).then(
        () => {
          if (argv.commit) {
            return util.git.commit(argv, data)
          }
        },
        err => console.error('Generation fail:', err),
      )
    },
    err => console.error('Contributor Update fail:', err),
  )
}

function checkContributors(argv) {
  const configData = util.configFile.readConfig(argv.config)

  return repo
    .getContributors(
      configData.projectOwner,
      configData.projectName,
      configData.repoType,
      configData.repoHost,
    )
    .then(repoContributors => {
      // console.log('repoContributors=')
      // console.dir(repoContributors) //['jfmengels', 'jakebolam', ...]
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
    })
}

function fetchContributors(argv) {
  // console.log('argv=', argv);
  // const configData = util.configFile.readConfig(argv.config)
  // console.log('configData')
  // console.dir(configData)

  return getContributors(argv.projectOwner, argv.projectName).then(
    repoContributors => {
      // repoContributors = {prCreators, prCommentators, issueCreators, issueCommentators, reviewers, commitAuthors, commitCommentators}
      // console.dir(repoContributors)

      // const checkKey = repo.getCheckKey(configData.repoType)
      // const knownContributions = configData.contributors.reduce((obj, item) => {
      //   obj[item[checkKey]] = item.contributions
      //   return obj
      // }, {})
      // console.log('knownContributions', knownContributions) //{ jfmengels: ['code', 'test', 'doc'], ...}
      // const knownContributors = configData.contributors.map(
      //   contributor => contributor[checkKey],
      // )
      // console.log('knownContributors', knownContributors) //['kentcdodds', 'ben-eb', ...]

      // let contributors = new Set(
      //   repoContributors.prCreators.map(usr => usr.login),
      // )

      // repoContributors.issueCreators.forEach(usr => contributors.add(usr.login))
      // repoContributors.reviewers.forEach(usr => contributors.add(usr.login))
      // repoContributors.commitAuthors.forEach(usr => contributors.add(usr.login))
      // contributors = Array.from(contributors)

      // console.log('ctbs=', contributors);

      //~1. Auto-add reviewers for review~
      //~2. Auto-add issue creators for any categories found~
      //~3. Auto-add commit authors~
      //4. Roll onto other contribution categories following https://www.draw.io/#G1uL9saIuZl3rj8sOo9xsLOPByAe28qhwa

      const args = {...argv, _: []}
      const contributorsToAdd = []
      repoContributors.reviewers.forEach(usr => {
        // args._ = ['add', usr.login, 'review']
        // addContribution(args)
        contributorsToAdd.push({login: usr.login, contributions: ['review']})
        // console.log(
        //   `Adding ${chalk.underline('Reviewer')} ${chalk.blue(usr.login)}`,
        // )
      })

      repoContributors.issueCreators.forEach(usr => {
        // console.log('usr=', usr.login, 'labels=', usr.labels)
        const contributor = {
          login: usr.login,
          contributions: [],
        }
        usr.labels.forEach(lbl => {
          const guesses = learner.classify(lbl).filter(c => c && c !== 'null')
          if (guesses.length) {
            const category = guesses[0]
            // args._ = ['', usr.login, category]
            // addContribution(args)
            if (!contributor.contributions.includes(category))
              contributor.contributions.push(category)
            // console.log(
            //   `Adding ${chalk.blue(usr.login)} for ${chalk.underline(category)}`,
            // )
          } //else console.warn(`Oops, I couldn't find any category for the "${lbl}" label`)
        })
        const existingContributor = contributorsToAdd.filter(
          ctrb => ctrb.login === usr.login,
        )
        if (existingContributor.length) {
          existingContributor[0].contributions = [
            ...new Set(
              existingContributor[0].contributions.concat(
                contributor.contributions,
              ),
            ),
          ]
        } else contributorsToAdd.push(contributor)
      })

      repoContributors.commitAuthors.forEach(usr => {
        // const contributor = {
        //   login: usr.login,
        //   contributions: [],
        // }
        // console.log('commit auth:', usr)
        const existingContributor = contributorsToAdd.filter(
          ctrb => ctrb.login === usr.login,
        )
        if (existingContributor.length) {
          //there's no label or commit message info so use only code for now
          if (!existingContributor[0].contributions.includes('code')) {
            existingContributor[0].contributions.push('code')
          }
        } else
          contributorsToAdd.push({login: usr.login, contributions: ['code']})
      })

      // console.log('contributorsToAdd=', contributorsToAdd)
      contributorsToAdd.forEach(contributor => {
        console.log(
          `Adding ${chalk.blue(contributor.login)} for ${chalk.underline(
            contributor.contributions.join('/'),
          )}`,
        )
        args._ = ['', contributor.login, contributor.contributions.join(',')]
        // if (contributor.contributions.length) addContribution(args)
        // else console.log('Skipping', contributor.login)
      })
    },
    err => console.error('fetch error:', err),
  )
}

function onError(error) {
  if (error) {
    console.error(error.message)
    process.exit(1)
  }
  process.exit(0)
}

function promptForCommand(argv) {
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

  return inquirer.prompt(questions).then(answers => {
    return answers.command || argv._[0]
  })
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
