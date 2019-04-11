#!/usr/bin/env node
/* eslint-disable no-console */

const path = require('path')
const yargs = require('yargs')
const chalk = require('chalk')
const inquirer = require('inquirer')

const init = require('./init')
const generate = require('./generate')
const util = require('./util')
const repo = require('./repo')
const updateContributors = require('./contributors')
const { getContributors } = require('./discover')

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
  const username = argv._[1]
  const contributions = argv._[2]
  // Add or update contributor in the config file
  return updateContributors(argv, username, contributions).then(data => {
    argv.contributors = data.contributors
    return startGeneration(argv).then(() => {
      if (argv.commit) {
        return util.git.commit(argv, data)
      }
    })
  })
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
  const configData = util.configFile.readConfig(argv.config)
  // console.log('configData')
  // console.dir(configData)

  return getContributors(
      configData.projectOwner,
      configData.projectName,
    )
    .then(repoContributors => {
      // repoContributors = {prCreators, prCommentators, issueCreators, issueCommentators, reviewers, commitAuthors, commitCommentators}
      // console.dir(repoContributors)

      const checkKey = repo.getCheckKey(configData.repoType)
      const knownContributions = configData.contributors.reduce((obj, item) => {
        obj[item[checkKey]] = item.contributions
        return obj
      }, {})
      // console.log('knownContributions', knownContributions) //{ jfmengels: ['code', 'test', 'doc'], ...}
      const knownContributors = configData.contributors.map(
        contributor => contributor[checkKey],
      )
      // console.log('knownContributors', knownContributors) //['kentcdodds', 'ben-eb', ...]

      let contributors = new Set(repoContributors.prCreators.map(usr => usr.login))

      repoContributors.issueCreators.forEach(usr => contributors.add(usr.login))
      repoContributors.reviewers.forEach(usr => contributors.add(usr.login))
      repoContributors.commitAuthors.forEach(usr => contributors.add(usr.login))
      contributors = Array.from(contributors)

      // console.log('ctbs=', contributors);
      const missingInConfig = contributors.filter(
        key => !knownContributors.includes(key),
      )

      const missingFromRepo = knownContributors.filter(key => {
        return (
          !contributors.includes(key) &&
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

      //1. Auto-add reviewers for review
      //2. Auto-add issue creators for bug/security
      //3. Find a way to distinguish bug from security contributions
      //4. Roll onto other contribution categories following https://www.draw.io/#G1uL9saIuZl3rj8sOo9xsLOPByAe28qhwa
    },
    err => console.error('checkContributorsFromNYC error:', err))
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
        throw new Error(`Unknown command ${command}`)
    }
  })
  .catch(onError)
