import {test, expect, vi, describe, beforeEach} from 'vitest'
import inquirer from 'inquirer'
import * as util from '../../util/index.js'
import {prompt} from '../prompt.js'

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}))

vi.mock('../../util/index.js', async () => {
  const actual = await vi.importActual('../../util/index.js')
  return {
    ...actual,
    git: {
      ...actual.git,
      getRepoInfo: vi.fn(),
    },
  }
})

describe('init prompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('populates projectName and projectOwner defaults when repo info is available', async () => {
    vi.mocked(util.git.getRepoInfo).mockResolvedValue({
      projectName: 'my-project',
      projectOwner: 'my-org',
    })

    const mockAnswers = {
      projectName: 'my-project',
      projectOwner: 'my-org',
      repoType: 'github',
      repoHost: 'https://github.com',
      contributorFile: 'README.md',
      needBadge: true,
      badgeFile: 'README.md',
      imageSize: 100,
      commit: true,
      commitConvention: 'angular',
      linkToUsage: true,
    }

    vi.mocked(inquirer.prompt).mockResolvedValue(mockAnswers)

    const result = await prompt()

    expect(util.git.getRepoInfo).toHaveBeenCalledTimes(1)
    expect(inquirer.prompt).toHaveBeenCalledTimes(1)

    // Check that questions received the repo defaults
    const questions = vi.mocked(inquirer.prompt).mock.calls[0][0]
    expect(questions[0].default).toBe('my-project')
    expect(questions[1].default).toBe('my-org')

    expect(result).toEqual({
      config: {
        projectName: 'my-project',
        projectOwner: 'my-org',
        repoType: 'github',
        repoHost: 'https://github.com',
        files: ['README.md'],
        imageSize: 100,
        commit: true,
        commitConvention: 'angular',
        contributors: [],
        contributorsPerLine: 7,
        linkToUsage: true,
      },
      contributorFile: 'README.md',
      badgeFile: 'README.md',
    })
  })

  test('proceeds when repo info is not available (null)', async () => {
    vi.mocked(util.git.getRepoInfo).mockResolvedValue(null)

    const mockAnswers = {
      projectName: 'custom-project',
      projectOwner: 'custom-owner',
      repoType: 'gitlab',
      repoHost: 'https://gitlab.com',
      contributorFile: 'CONTRIBUTORS.md',
      needBadge: false,
      badgeFile: undefined,
      imageSize: 120,
      commit: false,
      commitConvention: 'none',
      linkToUsage: false,
    }

    vi.mocked(inquirer.prompt).mockResolvedValue(mockAnswers)

    const result = await prompt()

    expect(result.config.projectName).toBe('custom-project')
    expect(result.config.projectOwner).toBe('custom-owner')
    expect(result.config.repoType).toBe('gitlab')
    expect(result.config.files).toEqual(['CONTRIBUTORS.md'])
    expect(result.badgeFile).toBeUndefined()
  })

  test('questions dynamic default and condition functions work correctly', async () => {
    vi.mocked(util.git.getRepoInfo).mockResolvedValue(null)

    let capturedQuestions = null
    vi.mocked(inquirer.prompt).mockImplementation(questions => {
      capturedQuestions = questions
      return Promise.resolve({
        projectName: 'proj',
        projectOwner: 'owner',
        repoType: 'github',
        repoHost: 'https://github.com',
        contributorFile: 'README.md',
        needBadge: true,
        badgeFile: 'README.md',
        imageSize: 100,
        commit: true,
        commitConvention: 'angular',
        linkToUsage: true,
      })
    })

    await prompt()

    const repoHostQuestion = capturedQuestions.find(q => q.name === 'repoHost')
    expect(repoHostQuestion.default({repoType: 'github'})).toBe(
      'https://github.com',
    )
    expect(repoHostQuestion.default({repoType: 'gitlab'})).toBe(
      'https://gitlab.com',
    )

    const badgeFileQuestion = capturedQuestions.find(
      q => q.name === 'badgeFile',
    )
    expect(badgeFileQuestion.when({needBadge: true})).toBe(true)
    expect(badgeFileQuestion.when({needBadge: false})).toBe(false)
    expect(badgeFileQuestion.default({contributorFile: 'DOCS.md'})).toBe(
      'DOCS.md',
    )

    const imageSizeQuestion = capturedQuestions.find(
      q => q.name === 'imageSize',
    )
    expect(imageSizeQuestion.filter('150')).toBe(150)
  })

  test('deduplicates files when contributorFile and badgeFile are different or the same', async () => {
    vi.mocked(util.git.getRepoInfo).mockResolvedValue(null)

    vi.mocked(inquirer.prompt).mockResolvedValue({
      projectName: 'proj',
      projectOwner: 'owner',
      repoType: 'github',
      repoHost: 'https://github.com',
      contributorFile: 'CONTRIBUTORS.md',
      needBadge: true,
      badgeFile: 'README.md',
      imageSize: 100,
      commit: true,
      commitConvention: 'angular',
      linkToUsage: true,
    })

    const result = await prompt()
    expect(result.config.files).toEqual(['CONTRIBUTORS.md', 'README.md'])
  })
})
