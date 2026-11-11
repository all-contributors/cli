import { readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';

import { expect } from 'vitest';

import { it as baseIt } from './fixtures.js';
import { runCli, runGit } from './run-cli.js';

const it = baseIt.extend({
  projectWithoutReadme: async ({ project }, use) => {
    await rm(path.join(project, 'README.md'));
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

it('add --commit commits the changed files with the whole message', async ({ gitProject }) => {
  const result = await runCli(['add', 'octocat', 'doc', '--commit'], { cwd: gitProject });
  const subject = await runGit(['log', '-1', '--format=%s'], { cwd: gitProject });
  const files = await runGit(['show', '--name-only', '--format='], { cwd: gitProject });

  expect(result.code).toBe(0);
  expect(subject).toBe('docs: update @octocat as a contributor');
  expect(files.split('\n').sort()).toEqual(['.all-contributorsrc', 'README.md']);
});

it('add --commit does not run the commit message in a shell', async ({ gitProject }) => {
  const commitTemplate = 'docs: update @octocat & echo pwned > pwned.txt &';
  const result = await runCli(
    ['add', 'octocat', 'doc', '--commit', '--commitTemplate', commitTemplate],
    {
      cwd: gitProject,
    },
  );
  const subject = await runGit(['log', '-1', '--format=%s'], { cwd: gitProject });

  expect(result.code).toBe(0);
  expect(subject).toBe(commitTemplate);
  expect(await readdir(gitProject)).not.toContain('pwned.txt');
});

it('generate exits 1 when the README is missing', async ({ projectWithoutReadme }) => {
  const result = await runCli(['generate'], { cwd: projectWithoutReadme });

  expect(result.code).toBe(1);
  expect(result.stderr).toContain('README.md');
  expect(result.stderr).toContain("Couldn't find README.md");
  expect(result.stderr).not.toContain('ENOENT');
  expect(result.stderr).not.toContain('at readFileToUpdate');
});
