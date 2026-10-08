import path from 'path'
import {test, expect, vi, describe, beforeEach} from 'vitest'
import {promisify} from 'util'
import {commit, getRepoInfo} from '../git'

vi.mock('child_process')
vi.mock('util')
vi.mock('../config-file', () => ({
  readConfig: vi.fn(() =>
    Promise.resolve({
      commitConvention: 'gitmoji',
    }),
  ),
}))

describe('getRepoInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should parse GitHub SSH URLs correctly', async () => {
    const mockExecAsync = vi.fn().mockResolvedValue({
      stdout: 'git@github.com:all-contributors/all-contributors-cli.git\n',
      stderr: '',
    })

    vi.mocked(promisify).mockReturnValue(mockExecAsync)

    const result = await getRepoInfo()

    expect(result).toEqual({
      projectOwner: 'all-contributors',
      projectName: 'all-contributors-cli',
    })
  })

  test('should parse GitHub HTTPS URLs correctly', async () => {
    const mockExecAsync = vi.fn().mockResolvedValue({
      stdout: 'https://github.com/all-contributors/all-contributors-cli.git\n',
      stderr: '',
    })

    vi.mocked(promisify).mockReturnValue(mockExecAsync)

    const result = await getRepoInfo()

    expect(result).toEqual({
      projectOwner: 'all-contributors',
      projectName: 'all-contributors-cli',
    })
  })

  test('should return null for invalid URLs', async () => {
    const mockExecAsync = vi.fn().mockResolvedValue({
      stdout: 'invalid-url\n',
      stderr: '',
    })

    vi.mocked(promisify).mockReturnValue(mockExecAsync)

    const result = await getRepoInfo()

    expect(result).toBeNull()
  })

  test('should handle git command errors', async () => {
    const mockExecAsync = vi
      .fn()
      .mockRejectedValue(new Error('Git command failed'))

    vi.mocked(promisify).mockReturnValue(mockExecAsync)

    await expect(getRepoInfo()).rejects.toThrow('Git command failed')
  })
})

describe('commit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockOptions = {
    files: ['README.md', 'package.json'],
    config: '.all-contributorsrc',
    commitTemplate: undefined,
    commitConvention: 'gitmoji',
  }
  const mockData = {
    username: 'jdoe',
    newContributor: true,
  }

  const expectedAddedFiles = [
    path.resolve(process.cwd(), 'README.md'),
    path.resolve(process.cwd(), 'package.json'),
    path.resolve(process.cwd(), '.all-contributorsrc'),
  ].join(' ')

  test('should add files and commit with correct message', async () => {
    const mockExecAsync = vi.fn().mockResolvedValue({stdout: '', stderr: ''})
    vi.mocked(promisify).mockReturnValue(mockExecAsync)

    await commit(mockOptions, mockData)

    expect(mockExecAsync).toHaveBeenCalledTimes(2)
    expect(mockExecAsync).toHaveBeenNthCalledWith(
      1,
      `git add ${expectedAddedFiles}`,
    )
    expect(mockExecAsync).toHaveBeenNthCalledWith(
      2,
      'git commit -m :busts_in_silhouette: Add @jdoe as a contributor',
    )
  })

  test('should handle custom commit templates', async () => {
    const mockExecAsync = vi.fn().mockResolvedValue({stdout: '', stderr: ''})
    vi.mocked(promisify).mockReturnValue(mockExecAsync)
    const customOptions = {
      ...mockOptions,
      commitTemplate:
        'docs: <%= newContributor ? "Add" : "Update" %> @<%= username %>',
    }

    await commit(customOptions, mockData)

    expect(mockExecAsync).toHaveBeenNthCalledWith(
      2,
      'git commit -m docs: Add @jdoe',
    )
  })

  test('should handle git add errors with proper error message', async () => {
    const gitError = new Error('Command failed')
    gitError.stderr = 'fatal: pathspec README.md did not match any files'
    gitError.code = 128
    const mockExecAsync = vi.fn().mockRejectedValueOnce(gitError)
    vi.mocked(promisify).mockReturnValue(mockExecAsync)

    await expect(commit(mockOptions, mockData)).rejects.toThrow(
      'fatal: pathspec README.md did not match any files',
    )
  })

  test('should handle git add errors with exit code fallback', async () => {
    const gitError = new Error('Command failed')
    gitError.code = 1
    const mockExecAsync = vi.fn().mockRejectedValueOnce(gitError)
    vi.mocked(promisify).mockReturnValue(mockExecAsync)

    await expect(commit(mockOptions, mockData)).rejects.toThrow(
      `git add ${expectedAddedFiles} - exit code: 1`,
    )
  })

  test('should handle git commit errors', async () => {
    const mockExecAsync = vi
      .fn()
      .mockResolvedValueOnce({stdout: '', stderr: ''}) // git add succeeds
      .mockRejectedValueOnce({
        stderr: 'nothing to commit, working tree clean',
        code: 1,
      }) // git commit fails
    vi.mocked(promisify).mockReturnValue(mockExecAsync)

    await expect(commit(mockOptions, mockData)).rejects.toThrow(
      'nothing to commit, working tree clean',
    )
  })
})
