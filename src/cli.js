#!/usr/bin/env node

import path from 'path'
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import * as YoctoColors from 'yoctocolors'
import inquirer from 'inquirer'

import {init} from './init/index.js'
import {generate} from './generate/index.js'
import * as util from './util/index.js'
import * as repo from './repo/index.js'
import {addContributor} from './contributors/index.js'

const cwd = process.cwd()
const defaultRCFile = path.join(cwd, '.all-contributorsrc')

function getArgs() {
  return yargs(hideBin(process.argv))
    .scriptName('all-contributors')
    .option('config', {
      alias: 'c',
      type: 'string',
      default: defaultRCFile,
      description: 'Path to config file',
    })
    .option('contributorsSortAlphabetically', {
      type: 'boolean',
      default: false,
      description:
        'Sort the list of contributors alphabetically in the generated list',
    })
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
    .default('contributors', []).argv
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
  const username = argv._[1] === undefined ? undefined : String(argv._[1])
  const contributions = argv._[2]

  // Add or update contributor in the config file
  const data = await addContributor(argv, username, contributions)

  argv.contributors = data.contributors

  await startGeneration(argv)

  // Commit if configured
  if (argv.commit) {
    return util.git.commit(argv, data)
  }
}

async function checkContributors(argv) {
  return repo
    .getContributors(
      argv.projectOwner,
      argv.projectName,
      argv.repoType,
      argv.repoHost,
    )
    .then(repoContributors => {
      const checkKey = repo.getCheckKey(argv.repoType)
      const knownContributions = argv.contributors.reduce((obj, item) => {
        obj[item[checkKey]] = item.contributions
        return obj
      }, {})
      const knownContributors = argv.contributors.map(
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
          YoctoColors.bold('Missing contributors in .all-contributorsrc:\n'),
        )
        process.stdout.write(`${missingInConfig.join(', ')}\n`)
      }

      if (missingFromRepo.length) {
        process.stdout.write('\n')
        process.stdout.write(
          YoctoColors.bold(
            'Unknown contributors found in .all-contributorsrc:\n',
          ),
        )
        process.stdout.write(`${missingFromRepo.join(', ')}\n`)
      }
    })
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
          name: 'Compare contributors from the repository with the credited ones',
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

async function run() {
  try {
    const argv = getArgs()

    // Load and merge config file data into argv
    try {
      const configData = await util.configFile.readConfig(argv.config)
      Object.assign(argv, configData)
    } catch (error) {
      if (error instanceof SyntaxError || argv.config !== defaultRCFile) {
        throw error
      }
      // If default config file doesn't exist, that's okay
    }

    const command = await promptForCommand(argv)

    switch (command) {
      case 'init':
        return init()
      case 'generate':
        return startGeneration(argv)
      case 'add':
        return addContribution(argv)
      case 'check':
        return checkContributors(argv)
      default:
        throw new Error(`Unknown command ${command}`)
    }
  } catch (e) {
    console.error(e.stack || e.message || e)
    process.exit(1)
  }
}

run()
