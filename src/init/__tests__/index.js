import {test, expect, vi, describe, beforeEach} from 'vitest'
import {promises as fs} from 'fs'
import {init} from '../index.js'
import {configFile} from '../../util/index.js'
import * as promptModule from '../prompt.js'

vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}))

vi.mock('../../util/index.js', async () => {
  const actual = await vi.importActual('../../util/index.js')
  return {
    ...actual,
    configFile: {
      ...actual.configFile,
      writeConfig: vi.fn().mockResolvedValue(),
    },
  }
})

vi.mock('../prompt.js', () => ({
  prompt: vi.fn(),
}))

describe('init command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('successfully initializes project with contributor list and badge', async () => {
    const mockConfig = {
      projectName: 'test-project',
      projectOwner: 'test-owner',
      repoType: 'github',
      repoHost: 'https://github.com',
      files: ['README.md'],
      imageSize: 100,
      commit: true,
      commitConvention: 'angular',
      contributors: [],
      contributorsPerLine: 7,
      linkToUsage: true,
    }

    vi.mocked(promptModule.prompt).mockResolvedValue({
      config: mockConfig,
      contributorFile: 'README.md',
      badgeFile: 'README.md',
    })

    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.readFile).mockResolvedValue(
      '# test-project\n\nProject description',
    )
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    await init()

    expect(promptModule.prompt).toHaveBeenCalledTimes(1)
    expect(configFile.writeConfig).toHaveBeenCalledWith(
      '.all-contributorsrc',
      mockConfig,
    )
    expect(fs.access).toHaveBeenCalledWith('README.md')
    expect(fs.readFile).toHaveBeenCalledWith('README.md', 'utf8')
    // writeFile called for contributor list and for badge
    expect(fs.writeFile).toHaveBeenCalled()
  })

  test('creates contributor file if it does not exist', async () => {
    const mockConfig = {
      projectName: 'test-project',
      projectOwner: 'test-owner',
      files: ['CONTRIBUTORS.md'],
      contributors: [],
    }

    vi.mocked(promptModule.prompt).mockResolvedValue({
      config: mockConfig,
      contributorFile: 'CONTRIBUTORS.md',
      badgeFile: undefined,
    })

    const notFoundError = new Error('ENOENT: no such file or directory')
    vi.mocked(fs.access).mockRejectedValueOnce(notFoundError)
    vi.mocked(fs.readFile).mockResolvedValue('')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    await init()

    // ensureFileExists creates the file with empty string
    expect(fs.writeFile).toHaveBeenCalledWith('CONTRIBUTORS.md', '')
    // injectInFile writes contributors list
    expect(fs.writeFile).toHaveBeenCalledWith(
      'CONTRIBUTORS.md',
      expect.stringContaining('## Contributors'),
    )
  })

  test('skips injecting badge if badgeFile is not specified', async () => {
    const mockConfig = {
      projectName: 'test-project',
      projectOwner: 'test-owner',
      files: ['README.md'],
      contributors: [],
    }

    vi.mocked(promptModule.prompt).mockResolvedValue({
      config: mockConfig,
      contributorFile: 'README.md',
      badgeFile: undefined,
    })

    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.readFile).mockResolvedValue('# Title\n\nDesc')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    await init()

    // readFile called only once for contributorFile
    expect(fs.readFile).toHaveBeenCalledTimes(1)
    expect(fs.readFile).toHaveBeenCalledWith('README.md', 'utf8')
  })

  test('propagates error if prompt rejects', async () => {
    vi.mocked(promptModule.prompt).mockRejectedValue(new Error('Prompt error'))

    await expect(init()).rejects.toThrow('Prompt error')
    expect(configFile.writeConfig).not.toHaveBeenCalled()
  })

  test('propagates error if writeConfig fails', async () => {
    vi.mocked(promptModule.prompt).mockResolvedValue({
      config: {},
      contributorFile: 'README.md',
      badgeFile: 'README.md',
    })

    vi.mocked(configFile.writeConfig).mockRejectedValue(
      new Error('Write config failed'),
    )

    await expect(init()).rejects.toThrow('Write config failed')
    expect(fs.access).not.toHaveBeenCalled()
  })
})
