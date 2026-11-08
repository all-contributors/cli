// Fixtures for the CLI E2E tests.
import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {test} from 'vitest'

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
}

const readme = `# Test project

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
`

export const it = test.extend({
  // Vitest requires the first argument to be destructured, even when empty
  // eslint-disable-next-line no-empty-pattern
  tmpDir: async ({}, use) => {
    const dir = await mkdtemp(path.join(tmpdir(), 'ac-e2e-'))
    await use(dir)
    await rm(dir, {recursive: true, force: true})
  },

  project: async ({tmpDir}, use) => {
    await writeFile(
      path.join(tmpDir, '.all-contributorsrc'),
      JSON.stringify(config, null, 2),
    )
    await writeFile(path.join(tmpDir, 'README.md'), readme)
    await use(tmpDir)
  },
})
