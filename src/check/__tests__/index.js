import {test, expect, vi, describe, beforeEach} from 'vitest'
import {promises as fs} from 'fs'
import {getIgnoredContributors, checkContributors} from '../index.js'
import * as repo from '../../repo/index.js'

vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
  },
}))

vi.mock('../../repo/index.js', () => ({
  getContributors: vi.fn(),
  getCheckKey: vi.fn().mockReturnValue('login'),
}))

describe('getIgnoredContributors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns empty set when no ignore sources are provided', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    const ignored = await getIgnoredContributors({}, '/mock/dir')
    expect(ignored.size).toBe(0)
  })

  test('extracts ignored contributors from argv.ignoredContributors', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    const argv = {
      ignoredContributors: ['Dependabot[bot]', 'renovate[bot]'],
    }
    const ignored = await getIgnoredContributors(argv, '/mock/dir')
    expect(ignored.has('dependabot[bot]')).toBe(true)
    expect(ignored.has('renovate[bot]')).toBe(true)
    expect(ignored.size).toBe(2)
  })

  test('parses ignore file with comments and whitespace', async () => {
    vi.mocked(fs.readFile).mockImplementation(async filePath => {
      if (filePath.endsWith('.all-contributorsrc-ignore')) {
        return '# Bots to ignore\n\n  dependabot[bot]  \n# internal bots\ngithub-actions[bot]\n'
      }
      throw new Error('ENOENT')
    })

    const ignored = await getIgnoredContributors({}, '/mock/dir')
    expect(ignored.has('dependabot[bot]')).toBe(true)
    expect(ignored.has('github-actions[bot]')).toBe(true)
    expect(ignored.size).toBe(2)
  })

  test('merges argv.ignoredContributors and .all-contributors-ignore', async () => {
    vi.mocked(fs.readFile).mockImplementation(async filePath => {
      if (filePath.endsWith('.all-contributors-ignore')) {
        return 'file-bot\n'
      }
      throw new Error('ENOENT')
    })

    const argv = {ignoredContributors: ['argv-bot']}
    const ignored = await getIgnoredContributors(argv, '/mock/dir')
    expect(ignored.has('argv-bot')).toBe(true)
    expect(ignored.has('file-bot')).toBe(true)
    expect(ignored.size).toBe(2)
  })
})

describe('checkContributors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
  })

  test('reports missing contributors when not ignored', async () => {
    vi.mocked(repo.getContributors).mockResolvedValue([
      'user1',
      'user2',
      'dependabot[bot]',
    ])

    const argv = {
      projectOwner: 'owner',
      projectName: 'project',
      repoType: 'github',
      repoHost: 'https://github.com',
      contributors: [
        {
          login: 'user1',
          contributions: ['code'],
        },
      ],
    }

    const mockStdout = {write: vi.fn()}
    const result = await checkContributors(argv, '/mock/dir', mockStdout)

    expect(result.missingInConfig).toEqual(['user2', 'dependabot[bot]'])
    expect(mockStdout.write).toHaveBeenCalledWith(
      expect.stringContaining('Missing contributors'),
    )
    expect(mockStdout.write).toHaveBeenCalledWith('user2, dependabot[bot]\n')
  })

  test('filters out ignored contributors from missing list', async () => {
    vi.mocked(repo.getContributors).mockResolvedValue([
      'user1',
      'user2',
      'dependabot[bot]',
    ])

    const argv = {
      projectOwner: 'owner',
      projectName: 'project',
      repoType: 'github',
      repoHost: 'https://github.com',
      ignoredContributors: ['dependabot[bot]'],
      contributors: [
        {
          login: 'user1',
          contributions: ['code'],
        },
      ],
    }

    const mockStdout = {write: vi.fn()}
    const result = await checkContributors(argv, '/mock/dir', mockStdout)

    expect(result.missingInConfig).toEqual(['user2'])
    expect(mockStdout.write).toHaveBeenCalledWith('user2\n')
  })

  test('filters out ignored contributors case-insensitively', async () => {
    vi.mocked(repo.getContributors).mockResolvedValue([
      'Dependabot[bot]',
      'USER2',
    ])

    const argv = {
      projectOwner: 'owner',
      projectName: 'project',
      repoType: 'github',
      repoHost: 'https://github.com',
      ignoredContributors: ['dependabot[bot]'],
      contributors: [],
    }

    const mockStdout = {write: vi.fn()}
    const result = await checkContributors(argv, '/mock/dir', mockStdout)

    expect(result.missingInConfig).toEqual(['USER2'])
  })

  test('reports unknown contributors present in config but missing from repository', async () => {
    vi.mocked(repo.getContributors).mockResolvedValue(['user1'])

    const argv = {
      projectOwner: 'owner',
      projectName: 'project',
      repoType: 'github',
      repoHost: 'https://github.com',
      contributors: [
        {
          login: 'user1',
          contributions: ['code'],
        },
        {
          login: 'ghost-contributor',
          contributions: ['code'],
        },
        {
          login: 'non-code-contributor',
          contributions: ['design'],
        },
      ],
    }

    const mockStdout = {write: vi.fn()}
    const result = await checkContributors(argv, '/mock/dir', mockStdout)

    expect(result.missingInConfig).toEqual([])
    expect(result.missingFromRepo).toEqual(['ghost-contributor'])
    expect(mockStdout.write).toHaveBeenCalledWith(
      expect.stringContaining('Unknown contributors found'),
    )
    expect(mockStdout.write).toHaveBeenCalledWith('ghost-contributor\n')
  })
})
