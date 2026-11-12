// Fixtures for the CLI E2E tests.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { test } from 'vitest';

import { runGit } from './run-cli.js';

const config = {
  projectName: 'test-project',
  projectOwner: 'test-owner',
  files: ['README.md'],
  contributors: [
    {
      login: 'octocat',
      name: 'The Octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231',
      profile: 'https://github.com/octocat',
      contributions: ['code'],
    },
  ],
};

const readme = `# Test project

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
`;

async function writeProject(dir) {
  await writeFile(path.join(dir, '.all-contributorsrc'), JSON.stringify(config, null, 2));
  await writeFile(path.join(dir, 'README.md'), readme);
}

export const it = test.extend({
  // Vitest requires the first argument to be destructured, even when empty
  // eslint-disable-next-line no-empty-pattern
  tmpDir: async ({}, use) => {
    const dir = await mkdtemp(path.join(tmpdir(), 'ac-e2e-'));
    await use(dir);
    await rm(dir, { recursive: true, force: true });
  },

  project: async ({ tmpDir }, use) => {
    await writeProject(tmpDir);
    await use(tmpDir);
  },

  // A project that is a git repository with one commit. Its directory name has a
  // space in it, so the paths that are passed to `git add` contain one too.
  gitProject: async ({ tmpDir }, use) => {
    const dir = path.join(tmpDir, 'my project');

    await mkdir(dir);
    await writeProject(dir);
    await runGit(['init', '--quiet'], { cwd: dir });
    await runGit(['config', 'user.name', 'Test'], { cwd: dir });
    await runGit(['config', 'user.email', 'test@example.com'], { cwd: dir });
    await runGit(['config', 'commit.gpgsign', 'false'], { cwd: dir });
    await runGit(['add', '.'], { cwd: dir });
    await runGit(['commit', '--quiet', '-m', 'init'], { cwd: dir });
    await use(dir);
  },
});
