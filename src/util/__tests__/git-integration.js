import fs from 'fs'
import os from 'os'
import path from 'path'
import {execFileSync} from 'child_process'
import {test, expect, describe, beforeEach, afterEach} from 'vitest'
import {commit} from '../git'

const git = (...args) => execFileSync('git', args, {encoding: 'utf8'}).trim()

describe('commit in a real git repository', () => {
  const originalCwd = process.cwd()
  let repoDir

  const options = {
    files: ['README.md'],
    config: '.all-contributorsrc',
    commitConvention: 'angular',
  }

  beforeEach(() => {
    // The space in the directory name covers the paths passed to `git add`
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'all contributors '))
    process.chdir(repoDir)

    git('init', '--quiet')
    git('config', 'user.name', 'Test')
    git('config', 'user.email', 'test@example.com')
    git('config', 'commit.gpgsign', 'false')

    fs.writeFileSync('README.md', '# Test\n')
    fs.writeFileSync('.all-contributorsrc', '{}\n')
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(repoDir, {recursive: true, force: true})
  })

  test('should commit the files with the whole message', async () => {
    await commit(options, {username: 'jdoe', newContributor: true})

    expect(git('log', '-1', '--format=%s')).toBe(
      'docs: add @jdoe as a contributor',
    )
    expect(git('show', '--name-only', '--format=').split('\n').sort()).toEqual([
      '.all-contributorsrc',
      'README.md',
    ])
  })

  test('should not pass the message through a shell', async () => {
    const username = 'jdoe & echo pwned > pwned.txt &'

    await commit(options, {username, newContributor: true})

    expect(git('log', '-1', '--format=%s')).toBe(
      `docs: add @${username} as a contributor`,
    )
    expect(fs.existsSync('pwned.txt')).toBe(false)
  })
})
