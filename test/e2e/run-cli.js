// Helper that runs the CLI and returns the code, stdout, and stderr.
import { execFile } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const cliPath = fileURLToPath(new URL('../../src/cli.js', import.meta.url));

export function runCli(args, { cwd = process.cwd() } = {}) {
  return new Promise((resolve) => {
    // run the CLI
    execFile(process.execPath, [cliPath, ...args], { cwd }, (error, stdout, stderr) => {
      resolve({ code: error ? error.code : 0, stdout, stderr });
    });
  });
}
