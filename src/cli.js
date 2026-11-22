#!/usr/bin/env node

import path from 'path';

import inquirer from 'inquirer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as YoctoColors from 'yoctocolors';

import { addContributor } from './contributors/index.js';
import { startGeneration } from './generate/start-generation.js';
import { init } from './init/index.js';
import * as repo from './repo/index.js';
import * as util from './util/index.js';

const cwd = process.cwd();
const defaultRCFile = path.join(cwd, '.all-contributorsrc');

const defaultOptions = {
  contributors: [],
  contributorsPerLine: 7,
  contributorsSortAlphabetically: false,
  files: ['README.md'],
};

function getCliArgs() {
  return yargs(hideBin(process.argv))
    .scriptName('all-contributors')
    .option('commit', {
      type: 'boolean',
      description: 'Whether or not to automatically commit changes made by the cli',
    })
    .option('config', {
      alias: 'c',
      type: 'string',
      default: defaultRCFile,
      description: 'Path to config file',
    })
    .option('contributors', {
      type: 'array',
      description: 'List of contributors',
    })
    .option('contributorsPerLine', {
      type: 'number',
      description: 'The number of contributors in one row of the table',
    })
    .option('contributorsSortAlphabetically', {
      type: 'boolean',
      description: 'Sort the list of contributors alphabetically in the generated list',
    })
    .option('files', {
      type: 'array',
      description: 'The files that contain the table and the badge, at most 25',
    })
    .help('help')
    .alias('h', 'help')
    .alias('v', 'version')
    .version()
    .recommendCommands()
    .command('generate', `Generate the list of contributors\n\nUSAGE: all-contributors generate`)
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
    ).argv;
}

async function addContribution(argv) {
  const username = argv._[1] === undefined ? undefined : String(argv._[1]);
  const contributions = argv._[2];

  // Add or update contributor in the config file
  const data = await addContributor(argv, username, contributions);

  argv.contributors = data.contributors;

  await startGeneration(argv);

  // Commit if configured
  if (argv.commit) {
    return util.git.commit(argv, data);
  }
}

async function checkContributors(argv) {
  return repo
    .getContributors(argv.projectOwner, argv.projectName, argv.repoType, argv.repoHost)
    .then((repoContributors) => {
      const checkKey = repo.getCheckKey(argv.repoType);
      const knownContributions = argv.contributors.reduce((obj, item) => {
        obj[item[checkKey]] = item.contributions;
        return obj;
      }, {});
      const knownContributors = argv.contributors.map((contributor) => contributor[checkKey]);

      const missingInConfig = repoContributors.filter((key) => !knownContributors.includes(key));
      const missingFromRepo = knownContributors.filter((key) => {
        return (
          !repoContributors.includes(key) &&
          (knownContributions[key].includes('code') || knownContributions[key].includes('test'))
        );
      });

      if (missingInConfig.length) {
        process.stdout.write(YoctoColors.bold('Missing contributors in .all-contributorsrc:\n'));
        process.stdout.write(`${missingInConfig.join(', ')}\n`);
      }

      if (missingFromRepo.length) {
        process.stdout.write('\n');
        process.stdout.write(
          YoctoColors.bold('Unknown contributors found in .all-contributorsrc:\n'),
        );
        process.stdout.write(`${missingFromRepo.join(', ')}\n`);
      }
    });
}

async function promptForCommand(argv) {
  const choices = [
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
  ];
  const questions = [
    {
      type: 'select',
      name: 'command',
      message: 'What do you want to do?',
      choices: choices,
      when: !argv._[0],
      default: choices[0].value,
    },
  ];

  return inquirer.prompt(questions).then((answers) => {
    return answers.command || argv._[0];
  });
}

const getOptions = async () => {
  const args = getCliArgs();

  // Load and merge config file data into argv
  try {
    const configData = await util.configFile.readConfig(args.config);
    return {
      ...defaultOptions,
      ...configData,
      ...args,
    };
  } catch (error) {
    if (args.config !== defaultRCFile || error.cause?.code !== 'ENOENT') {
      throw error;
    }
  }
  return { ...defaultOptions, ...args };
};

async function run() {
  try {
    const options = await getOptions();

    const command = await promptForCommand(options);

    switch (command) {
      case 'init':
        return await init();
      case 'generate':
        return await startGeneration(options);
      case 'add':
        return await addContribution(options);
      case 'check':
        return await checkContributors(options);
      default:
        throw new util.UserError(
          `Unknown command: ${command}\n` +
            'Valid commands are init, generate, add, and check.\n' +
            'Run `all-contributors --help` for more details.',
        );
    }
  } catch (e) {
    if (e instanceof util.UserError) {
      console.error(e.message);
    } else {
      console.error(e.stack || e.message || e);
    }
    process.exitCode = 1;
  }
}

run();
