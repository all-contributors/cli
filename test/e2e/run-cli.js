// Helpers that run the CLI, and git, in a directory.
import { execFile } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const defaultCliPath = path.join(import.meta.dirname, '../../src/cli.js');

// Runs git and returns its trimmed stdout.
export async function runGit(args, { cwd }) {
  const { stdout } = await promisify(execFile)('git', args, { cwd });

  return stdout.trim();
}

// Runs the CLI and returns the code, stdout, and stderr.
export function runCli(
  args,
  { cliPath = defaultCliPath, cwd = process.cwd(), timeout = 0, waitFor } = {},
) {
  return new Promise((resolve) => {
    // run the CLI
    const child = execFile(
      process.execPath,
      [cliPath, ...args],
      { cwd, timeout },
      (error, stdout, stderr) => {
        resolve({
          code: error ? error.code : 0,
          stdout,
          stderr,
          killed: Boolean(error?.killed),
        });
      },
    );

    // stop the CLI once stdout contains `waitFor`
    if (waitFor) {
      let output = '';
      child.stdout.on('data', (chunk) => {
        output += chunk;
        if (output.includes(waitFor)) child.kill();
      });
    }
  });
}
