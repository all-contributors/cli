import {test, expect, vi, describe, beforeEach} from 'vitest'
import {addContributor} from '../index.js'
import * as util from '../../util/index.js'
import * as repo from '../../repo/index.js'
import * as promptModule from '../prompt.js'

vi.mock('../../util/index.js', async () => {
  const actual = await vi.importActual('../../util/index.js')
  return {
    ...actual,
    configFile: {
      ...actual.configFile,
      writeContributors: vi.fn().mockResolvedValue(),
    },
  }
})

vi.mock('../../repo/index.js', async () => {
  const actual = await vi.importActual('../../repo/index.js')
  return {
    ...actual,
    getUserInfo: vi.fn(),
  }
})

vi.mock('../prompt.js', () => ({
  prompt: vi.fn(),
}))

describe('addContributor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('successfully adds a new contributor', async () => {
    const options = {
      config: '.all-contributorsrc',
      repoType: 'github',
      repoHost: 'https://github.com',
      contributors: [
        {
          login: 'existinguser',
          name: 'Existing User',
          avatar_url: 'https://avatar.example.com',
          profile: 'https://profile.example.com',
          contributions: ['code'],
        },
      ],
    }

    vi.mocked(promptModule.prompt).mockResolvedValue({
      username: 'newuser',
      contributions: ['doc'],
    })

    vi.mocked(repo.getUserInfo).mockResolvedValue({
      login: 'newuser',
      name: 'New User',
      avatar_url: 'https://avatar.newuser.example.com',
      profile: 'https://profile.newuser.example.com',
    })

    const result = await addContributor(options, 'newuser', 'doc')

    expect(promptModule.prompt).toHaveBeenCalledWith(options, 'newuser', 'doc')
    expect(repo.getUserInfo).toHaveBeenCalledWith(
      'newuser',
      'github',
      'https://github.com',
    )
    expect(util.configFile.writeContributors).toHaveBeenCalledTimes(1)
    expect(result.username).toBe('newuser')
    expect(result.contributions).toEqual(['doc'])
    expect(result.newContributor).toBe(true)
    expect(result.contributors).toHaveLength(2)
    expect(result.contributors[1]).toEqual({
      login: 'newuser',
      name: 'New User',
      avatar_url: 'https://avatar.newuser.example.com',
      profile: 'https://profile.newuser.example.com',
      contributions: ['doc'],
    })
  })

  test('successfully updates an existing contributor without fetching network info', async () => {
    const options = {
      config: '.all-contributorsrc',
      repoType: 'github',
      repoHost: 'https://github.com',
      contributors: [
        {
          login: 'existinguser',
          name: 'Existing User',
          avatar_url: 'https://avatar.example.com',
          profile: 'https://profile.example.com',
          contributions: ['code'],
        },
      ],
    }

    vi.mocked(promptModule.prompt).mockResolvedValue({
      username: 'existinguser',
      contributions: ['code', 'ideas'],
    })

    const result = await addContributor(options, 'existinguser', [
      'code',
      'ideas',
    ])

    expect(promptModule.prompt).toHaveBeenCalledWith(options, 'existinguser', [
      'code',
      'ideas',
    ])
    expect(repo.getUserInfo).not.toHaveBeenCalled()
    expect(util.configFile.writeContributors).toHaveBeenCalledTimes(1)
    expect(result.username).toBe('existinguser')
    expect(result.contributions).toEqual(['code', 'ideas'])
    expect(result.newContributor).toBe(false)
    expect(result.contributors).toHaveLength(1)
    expect(result.contributors[0].contributions).toEqual(['code', 'ideas'])
  })

  test('recognizes existing contributor case-insensitively (newContributor: false)', async () => {
    const options = {
      config: '.all-contributorsrc',
      repoType: 'github',
      repoHost: 'https://github.com',
      contributors: [
        {
          login: 'JaneDoe',
          name: 'Jane Doe',
          avatar_url: 'https://avatar.example.com',
          profile: 'https://profile.example.com',
          contributions: ['code'],
        },
      ],
    }

    vi.mocked(promptModule.prompt).mockResolvedValue({
      username: 'janedoe',
      contributions: ['code', 'review'],
    })

    const result = await addContributor(options, 'janedoe', ['code', 'review'])

    expect(repo.getUserInfo).not.toHaveBeenCalled()
    expect(result.newContributor).toBe(false)
    expect(result.contributors).toHaveLength(1)
    expect(result.contributors[0].contributions).toEqual(['code', 'review'])
  })

  test('propagates error when prompt rejects', async () => {
    const options = {
      config: '.all-contributorsrc',
      contributors: [],
    }

    const promptError = new Error('Prompt cancelled')
    vi.mocked(promptModule.prompt).mockRejectedValue(promptError)

    await expect(addContributor(options, undefined, undefined)).rejects.toThrow(
      'Prompt cancelled',
    )
    expect(repo.getUserInfo).not.toHaveBeenCalled()
    expect(util.configFile.writeContributors).not.toHaveBeenCalled()
  })

  test('propagates error when repo.getUserInfo fails', async () => {
    const options = {
      config: '.all-contributorsrc',
      repoType: 'github',
      repoHost: 'https://github.com',
      contributors: [],
    }

    vi.mocked(promptModule.prompt).mockResolvedValue({
      username: 'unknownuser',
      contributions: ['doc'],
    })

    const networkError = new Error('GitHub API error: user not found')
    vi.mocked(repo.getUserInfo).mockRejectedValue(networkError)

    await expect(
      addContributor(options, 'unknownuser', ['doc']),
    ).rejects.toThrow('GitHub API error: user not found')
    expect(util.configFile.writeContributors).not.toHaveBeenCalled()
  })

  test('propagates error when configFile.writeContributors fails', async () => {
    const options = {
      config: '.all-contributorsrc',
      repoType: 'github',
      repoHost: 'https://github.com',
      contributors: [],
    }

    vi.mocked(promptModule.prompt).mockResolvedValue({
      username: 'newuser',
      contributions: ['doc'],
    })

    vi.mocked(repo.getUserInfo).mockResolvedValue({
      login: 'newuser',
      name: 'New User',
      avatar_url: 'https://avatar.example.com',
      profile: 'https://profile.example.com',
    })

    const writeError = new Error('EACCES: permission denied')
    vi.mocked(util.configFile.writeContributors).mockRejectedValue(writeError)

    await expect(addContributor(options, 'newuser', ['doc'])).rejects.toThrow(
      'EACCES: permission denied',
    )
  })
})
