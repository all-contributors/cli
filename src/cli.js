#!/usr/bin/env node
/* eslint-disable no-console */

const path = require('path')
const yargs = require('yargs')
const chalk = require('chalk')
const inquirer = require('inquirer')

const init = require('./lib/init')
const generate = require('./lib/generate')
const util = require('./lib/util')
const updateContributors = require('./lib/contributors')

const cwd = process.cwd()
const defaultRCFile = path.join(cwd, '.all-contributorsrc')

const argv = yargs
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
    'Compares contributors from GitHub with the ones credited in .all-contributorsrc',
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
      if (configPath !== defaultRCFile) {
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

function checkContributors() {
  const configData = util.configFile.readConfig(argv.config)

  return util
    .check(configData.projectOwner, configData.projectName)
    .then(ghContributors => {
      const knownContributions = configData.contributors.reduce((obj, item) => {
        obj[item.login] = item.contributions
        return obj
      }, {})
      const knownContributors = configData.contributors.map(
        contributor => contributor.login,
      )

      const missingInConfig = ghContributors.filter(
        login => !knownContributors.includes(login),
      )
      const missingFromGithub = knownContributors.filter(login => {
        return (
          !ghContributors.includes(login) &&
          (knownContributions[login].includes('code') ||
            knownContributions[login].includes('test'))
        )
      })

      if (missingInConfig.length) {
        process.stdout.write(
          chalk.bold('Missing contributors in .all-contributorsrc:\n'),
        )
        process.stdout.write(`    ${missingInConfig.join(', ')}\n`)
      }

      if (missingFromGithub.length) {
        process.stdout.write(
          chalk.bold('Unknown contributors found in .all-contributorsrc:\n'),
        )
        process.stdout.write(`    ${missingFromGithub.join(', ')}\n`)
      }
    })
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
          name: 'Add a new contributor or add a new contribution type',
          value: 'add',
        },
        {
          name: 'Re-generate the contributors list',
          value: 'generate',
        },
        {
          name: 'Compare contributors from GitHub with the credited ones',
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

promptForCommand(argv)
  .then(command => {
    switch (command) {
      case 'init':
        return init()
      case 'generate':
        return startGeneration(argv)
      case 'add':
        return addContribution(argv)
      case 'check':
        return checkContributors()
      default:
        throw new Error(`Unknown command ${command}`)
    }
  })
  .catch(onError)
