import { describe, expect, it, vi } from 'vitest';

import { createPrompts } from '../prompt.js';

const prompts = vi.hoisted(() => ({
  confirm: vi.fn(),
  input: vi.fn(),
  select: vi.fn(),
}));

vi.mock('@inquirer/prompts', () => prompts);

describe('createPrompts', () => {
  it('creates init prompts and builds the config result', async () => {
    prompts.input
      .mockReset()
      .mockResolvedValueOnce('all-contributors-cli')
      .mockResolvedValueOnce('all-contributors')
      .mockResolvedValueOnce('https://github.example.com')
      .mockResolvedValueOnce('CONTRIBUTORS.md')
      .mockResolvedValueOnce('BADGES.md')
      .mockResolvedValueOnce('80');
    prompts.confirm
      .mockReset()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);
    prompts.select.mockReset().mockResolvedValueOnce('gitlab').mockResolvedValueOnce('atom');

    const result = await createPrompts({
      projectName: 'default-project',
      projectOwner: 'default-owner',
    });

    expect(result).toEqual({
      config: {
        projectName: 'all-contributors-cli',
        projectOwner: 'all-contributors',
        repoType: 'gitlab',
        repoHost: 'https://github.example.com',
        files: ['CONTRIBUTORS.md', 'BADGES.md'],
        imageSize: 80,
        commit: true,
        commitConvention: 'atom',
        contributors: [],
        contributorsPerLine: 7,
        linkToUsage: true,
      },
      contributorFile: 'CONTRIBUTORS.md',
      badgeFile: 'BADGES.md',
    });
    expect(prompts.input).toHaveBeenNthCalledWith(1, {
      message: "What's the name of the repository?",
      default: 'default-project',
    });
    expect(prompts.input).toHaveBeenNthCalledWith(2, {
      message: 'Who is the owner of the repository?',
      default: 'default-owner',
    });
    expect(prompts.confirm).toHaveBeenCalledTimes(3);
    expect(prompts.select).toHaveBeenCalledTimes(2);
  });

  it('omits the badge file when the badge prompt is declined', async () => {
    prompts.input
      .mockReset()
      .mockResolvedValueOnce('project')
      .mockResolvedValueOnce('owner')
      .mockResolvedValueOnce('https://github.com')
      .mockResolvedValueOnce('README.md')
      .mockResolvedValueOnce('100');
    prompts.confirm
      .mockReset()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);
    prompts.select.mockReset().mockResolvedValueOnce('github').mockResolvedValueOnce('none');

    const result = await createPrompts(undefined);

    expect(result.badgeFile).toBeUndefined();
    expect(result.config.files).toEqual(['README.md']);
    expect(result.config.commit).toBe(false);
    expect(result.config.linkToUsage).toBe(false);
  });
});
