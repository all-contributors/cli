import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPrompts } from '../prompt.js';

const prompts = vi.hoisted(() => ({
  confirm: vi.fn(),
  isCancel: vi.fn(),
  text: vi.fn(),
  select: vi.fn(),
}));

vi.mock('@clack/prompts', () => prompts);

const mockPrompts = () => {
  prompts.text
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
};

describe('createPrompts', () => {
  beforeEach(() => {
    prompts.isCancel.mockReset().mockReturnValue(false);
  });

  it('creates init prompts and builds the config result', async () => {
    mockPrompts();

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
    expect(prompts.text).toHaveBeenNthCalledWith(1, {
      message: "What's the name of the repository?",
      initialValue: 'default-project',
    });
    expect(prompts.text).toHaveBeenNthCalledWith(2, {
      message: 'Who is the owner of the repository?',
      initialValue: 'default-owner',
    });
    expect(prompts.confirm).toHaveBeenCalledTimes(3);
    expect(prompts.select).toHaveBeenCalledTimes(2);
  });

  it('omits the badge file when the badge prompt is declined', async () => {
    prompts.text
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

  it.each(Array.from({ length: 11 }, (_, index) => index))(
    'returns undefined when the user cancels prompt %s',
    async (index) => {
      mockPrompts();
      prompts.isCancel.mockReset();
      for (let i = 0; i < index; i++) {
        prompts.isCancel.mockReturnValueOnce(false);
      }
      prompts.isCancel.mockReturnValue(true);

      const result = await createPrompts({
        projectName: 'default-project',
        projectOwner: 'default-owner',
      });

      expect(result).toBeUndefined();
    },
  );
});
