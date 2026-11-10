import { promises as fs } from 'fs';
import path from 'path';

import { UserError } from '../util/user-error.js';
import { generate } from './index.js';

async function readFileToUpdate(file, cwd) {
  try {
    return await fs.readFile(path.join(cwd, file), 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new UserError(
        `Couldn't find ${file} in ${cwd}.\n` +
          'Create the file, or update "files" in .all-contributorsrc.',
      );
    }
    throw error;
  }
}

export async function startGeneration(options, cwd = process.cwd()) {
  await Promise.all(
    options.files.map(async (file) => {
      const fileContent = await readFileToUpdate(file, cwd);
      const newFileContent = generate(options, options.contributors, fileContent);

      await fs.writeFile(path.join(cwd, file), newFileContent);
    }),
  );
}
