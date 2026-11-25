import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prompt } from '../prompt.js';

const prompts = vi.hoisted(() => ({
  isCancel: vi.fn(),
  multiselect: vi.fn(),
  text: vi.fn(),
}));

vi.mock('@clack/prompts', () => prompts);

beforeEach(() => {
  prompts.isCancel.mockReset().mockReturnValue(false);
  prompts.multiselect.mockReset().mockResolvedValue(['code']);
  prompts.text.mockReset().mockResolvedValue('new-user');
});

function fixtures() {
  const options = {
    repoType: 'github',
    contributors: [
      {
        login: 'jfmengels',
        name: 'Jeroen Engels',
        avatar_url: 'https://avatars.githubusercontent.com/u/3869412?v=3',
        profile: 'https://github.com/jfmengels',
        contributions: [],
      },
      {
        login: 'kentcdodds',
        name: 'Kent C. Dodds',
        avatar_url: 'https://avatars.githubusercontent.com/u/1500684?v=3',
        profile: 'http://kentcdodds.com/',
        contributions: [],
      },
      {
        login: 'jccguimaraes',
        name: 'João Guimarães',
        avatar_url: 'https://avatars.githubusercontent.com/u/14871650?v=3',
        profile: 'https://github.com/jccguimaraes',
        contributions: [],
      },
    ],
  };
  return options;
}

describe('prompt', () => {
  it('should throw error if all contribution types are invalid', async () => {
    const options = fixtures();
    const username = 'userName';
    const contributions = 'invalidContributionType1,invalidContributionType2';
    expect(() => prompt(options, username, contributions)).toThrow(
      'invalidContributionType1,invalidContributionType2 is/are invalid contribution type(s)',
    );
  });

  it('should not throw error if at least one of the contribution types is valid', async () => {
    const options = fixtures();
    const username = 'userName';
    const contributions = 'wrongContributionType,code';

    const answers = await prompt(options, username, contributions);

    expect(answers).toEqual({ username: 'userName', contributions: ['code'] });
  });

  it('should filter valid contribution types from user inserted types', async () => {
    const options = fixtures();
    const username = 'userName';
    const contributions = 'invalidContributionType1,code,invalidContributionType2,bug';

    const answers = await prompt(options, username, contributions);

    expect(answers.contributions).toHaveLength(2);
    expect(answers.contributions).toEqual(['code', 'bug']);
  });

  it('configures username prompt with validation', async () => {
    const options = fixtures();

    await prompt(options);

    const usernamePrompt = prompts.text.mock.calls[0][0];
    expect(usernamePrompt.message).toBe("What is the contributor's GitHub username?");
    expect(usernamePrompt.validate('new-user')).toBeUndefined();
  });

  it('returns undefined when the user cancels the first question', async () => {
    const options = fixtures();
    prompts.isCancel.mockReturnValue(true);

    const results = await prompt(options);

    expect(results).toBeUndefined();
    const contributorsPrompt = prompts.multiselect.mock.calls[0];
    expect(contributorsPrompt).toBeUndefined();
  });

  it('returns undefined when the user cancels the second question', async () => {
    const options = fixtures();
    prompts.isCancel.mockReturnValueOnce(false).mockReturnValue(true);

    const results = await prompt(options);

    expect(results).toBeUndefined();

    const contributorsPrompt = prompts.multiselect.mock.calls[0][0];
    expect(contributorsPrompt.message).toBe('What are the contribution types?');
  });
});
