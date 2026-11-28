#!/usr/bin/env node

import path from 'path';

import { cancel, intro, isCancel, log, outro, select, spinner } from '@clack/prompts';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as YoctoColors from 'yoctocolors';

import packageJson from '../package.json' with { type: 'json' };
import { addContributor } from './contributors/index.js';
import { startGeneration } from './generate/start-generation.js';
import { init } from './init/index.js';
import * as repo from './repo/index.js';
import { cliStatuses } from './util/cliStatuses.js';
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
    .version(packageJson.version)
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
  if (data === undefined) {
    return cliStatuses.cancelled;
  }

  argv.contributors = data.contributors;

  await startGeneration(argv);

  // Commit if configured
  if (argv.commit) {
    await util.git.commit(argv, data);
  }
  return cliStatuses.success;
}

async function checkContributors(argv) {
  const s = spinner();
  s.start('Checking contributors');

  const repoContributors = await repo;

  s.stop('Validation complete');

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
    log.info(
      YoctoColors.bold('Missing contributors in .all-contributorsrc:\n') +
        `${missingInConfig.join(', ')}`,
    );
  }

  if (missingFromRepo.length) {
    log.info(
      YoctoColors.bold('Unknown contributors found in .all-contributorsrc:\n') +
        `${missingFromRepo.join(', ')}\n`,
    );
  }
  return cliStatuses.success;
}

async function promptForCommand() {
  const options = [
    {
      label: 'Add new contributor or edit contribution type',
      value: 'add',
    },
    {
      label: 'Re-generate the contributors list',
      value: 'generate',
    },
    {
      label: 'Compare contributors from the repository with the credited ones',
      value: 'check',
    },
  ];

  return select({
    message: 'What do you want to do?',
    options,
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
    // If default config file doesn't exist, that's okay
  }
  return { ...defaultOptions, ...args };
};

async function run() {
  try {
    const options = await getOptions();

    let command;
    if (options._[0]) {
      command = options._[0];
    } else {
      command = await promptForCommand();
    }

    if (isCancel(command)) {
      return;
    }

    intro('all-contributors-cli');
    let status = cliStatuses.success;

    switch (command) {
      case 'init':
        status = await init();
        break;
      case 'generate':
        status = await startGeneration(options);
        break;
      case 'add':
        status = await addContribution(options);
        break;
      case 'check':
        status = await checkContributors(options);
        break;
      default:
        throw new util.UserError(
          `Unknown command: ${command}\n` +
            'Valid commands are init, generate, add, and check.\n' +
            'Run `all-contributors --help` for more details.',
        );
    }

    if (status === cliStatuses.cancelled) {
      return;
    } else {
      outro("You're all set!");
    }
  } catch (e) {
    if (e instanceof util.UserError) {
      log.error(e.message);
    } else {
      log.error(e.stack || e.message || e);
    }
    process.exitCode = 1;
    cancel('Oops! There was an error.');
  }
}

run();
