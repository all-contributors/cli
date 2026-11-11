import { readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';

import { expect } from 'vitest';

import { it as baseIt } from './fixtures.js';
import { runCli } from './run-cli.js';

const it = baseIt.extend({
  projectWithoutReadme: async ({ project }, use) => {
    await rm(path.join(project, 'README.md'));
    await use(project);
  },
  projectWithoutConfig: async ({ project }, use) => {
    await rm(path.join(project, '.all-contributorsrc'));
    await use(project);
  },
});

it('--help exits 0 and lists the commands', async ({ tmpDir }) => {
  const result = await runCli(['--help'], { cwd: tmpDir });

  expect(result.code).toBe(0);
  expect(result.stdout).toContain('generate');
});

it('--help does not create any files', async ({ tmpDir }) => {
  await runCli(['--help'], { cwd: tmpDir });

  expect(await readdir(tmpDir)).toEqual([]);
});

it('generate adds contributors to the README', async ({ project }) => {
  const result = await runCli(['generate'], { cwd: project });
  const newReadme = await readFile(path.join(project, 'README.md'), 'utf8');

  expect(result.code).toBe(0);
  expect(newReadme).toContain('The Octocat');
  expect(newReadme).toContain('https://github.com/octocat');
});

it('generate exits 1 when the README is missing', async ({ projectWithoutReadme }) => {
  const result = await runCli(['generate'], { cwd: projectWithoutReadme });

  expect(result.code).toBe(1);
  expect(result.stderr).toContain('README.md');
  expect(result.stderr).toContain("Couldn't find README.md");
  expect(result.stderr).not.toContain('ENOENT');
  expect(result.stderr).not.toContain('at readFileToUpdate');
});

it('generate exits 0 when the default config is missing', async ({ projectWithoutConfig }) => {
  const result = await runCli(['generate'], { cwd: projectWithoutConfig });

  expect(result.code).toBe(0);
});

it('exits 1 when the -c config file does not exist', async ({ tmpDir }) => {
  const result = await runCli(['generate', '-c', 'missing.json'], {
    cwd: tmpDir,
  });

  expect(result.code).toBe(1);
  expect(result.stderr).toContain('Configuration file not found');
  expect(result.stderr).not.toContain('at readConfigFile');
  expect(result.stderr).toContain('all-contributors init');
});
