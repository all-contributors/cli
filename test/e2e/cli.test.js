import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { expect } from 'vitest';

import { it as baseIt } from './fixtures.js';
import { runCli, runGit } from './run-cli.js';

const it = baseIt.extend({
  projectWithoutReadme: async ({ project }, use) => {
    await rm(path.join(project, 'README.md'));
    await use(project);
  },
  projectWithoutConfig: async ({ project }, use) => {
    await rm(path.join(project, '.all-contributorsrc'));
    await use(project);
  },
  projectWithMalformedConfig: async ({ project }, use) => {
    await writeFile(path.join(project, '.all-contributorsrc'), '{');
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

it('generate exits 0 when the default config is missing', async ({ projectWithoutConfig }) => {
  const result = await runCli(['generate'], { cwd: projectWithoutConfig });

  expect(result.code).toBe(0);
});

it('generate exits 1 when the default config has malformed JSON', async ({
  projectWithMalformedConfig,
}) => {
  const result = await runCli(['generate'], { cwd: projectWithMalformedConfig });

  expect(result.code).toBe(1);
  expect(result.stderr).toContain('Configuration file has malformed JSON');
  expect(result.stderr).toContain('.all-contributorsrc');
  expect(result.stderr).toContain('all-contributors init');
  expect(result.stderr).not.toContain('at readConfigFile');
});

it('bare command waits on the prompt', async ({ project }) => {
  const result = await runCli([], {
    cwd: project,
    timeout: 5000,
    waitFor: 'What do you want to do?',
  });

  expect(result.killed).toBe(true);
  expect(result.stdout).toContain('What do you want to do?');
});

it('exits 1 for an unknown command', async ({ tmpDir }) => {
  const result = await runCli(['nope'], { cwd: tmpDir });

  expect(result.code).toBe(1);
  expect(result.stderr).toContain('Unknown command: nope');
  expect(result.stderr).toContain('all-contributors --help');
  expect(result.stderr).not.toContain('at run');
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
