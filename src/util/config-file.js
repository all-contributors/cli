import { promises as fs } from 'fs';

import jf from 'json-fixer';

import { formatConfig } from './formatting.js';
import { UserError } from './user-error.js';

export async function readConfig(configPath) {
  const config = await readConfigFile(configPath);

  return { repoType: 'github', commitConvention: 'angular', ...config };
}

async function readConfigFile(configPath) {
  let configFileContents;
  try {
    configFileContents = await fs.readFile(configPath, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new UserError(
        `Configuration file not found: ${configPath}\n` +
          'Check that the path is correct, or run `all-contributors init` ' +
          'to create a new configuration file.',
        { cause: error },
      );
    }
    throw error;
  }

  let config;
  let changed;
  try {
    // json-fixer prints "There's still an error!" to stderr itself before
    // throwing on malformed JSON message. json-fixer has no option to turn that off.
    // we could do something hacky to silence this in the future
    ({ data: config, changed } = jf(configFileContents));
  } catch (error) {
    throw new UserError(
      `Configuration file has malformed JSON: ${configPath}\n${error.message}\n` +
        'Fix the JSON in this file, or delete it and run `all-contributors init`.',
      { cause: error },
    );
  }

  if (changed) {
    const formatterConfig = await formatConfig(configPath, config);
    //Updates the file with fixes
    await fs.writeFile(configPath, formatterConfig);
  }

  return config;
}

export async function writeConfig(configPath, content) {
  if (!content.projectOwner) {
    throw new Error(`Error! Project owner is not set in ${configPath}`);
  }

  if (!content.projectName) {
    throw new Error(`Error! Project name is not set in ${configPath}`);
  }

  if (content.files && !content.files.length) {
    throw new Error(`Error! Project files was overridden and is empty in ${configPath}`);
  }

  return fs.writeFile(configPath, `${await formatConfig(configPath, content)}\n`);
}

export async function writeContributors(configPath, contributors) {
  let config;

  try {
    config = await readConfigFile(configPath);
  } catch (error) {
    return Promise.reject(error);
  }
  const content = { ...config, contributors };

  return writeConfig(configPath, content);
}
