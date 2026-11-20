import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prompt } from '../prompt.js';

const prompts = vi.hoisted(() => ({
  checkbox: vi.fn(),
  input: vi.fn(),
}));

vi.mock('@inquirer/prompts', () => prompts);

beforeEach(() => {
  prompts.checkbox.mockReset().mockResolvedValue(['code']);
  prompts.input.mockReset().mockResolvedValue('new-user');
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
  it('should throw error if all contribution types are invalid', () => {
    const options = fixtures();
    const username = 'userName';
    const contributions = 'invalidContributionType1,invalidContributionType2';
    expect(() => prompt(options, username, contributions)).toThrow(
      'invalidContributionType1,invalidContributionType2 is/are invalid contribution type(s)',
    );
  });

  it('should not throw error if at least one of the contribution types is valid', () => {
    const options = fixtures();
    const username = 'userName';
    const contributions = 'wrongContributionType,code';
    return prompt(options, username, contributions).then((answers) => {
      expect(answers).toEqual({ username: 'userName', contributions: ['code'] });
    });
  });

  it('should filter valid contribution types from user inserted types', () => {
    const options = fixtures();
    const username = 'userName';
    const contributions = 'invalidContributionType1,code,invalidContributionType2,bug';
    return prompt(options, username, contributions).then((answers) => {
      expect(answers.contributions).toHaveLength(2);
      expect(answers.contributions).toEqual(['code', 'bug']);
    });
  });

  it('configures username and contribution prompts with validation', async () => {
    const options = fixtures();
    await prompt(options);

    const usernamePrompt = prompts.input.mock.calls[0][0];
    expect(usernamePrompt.message).toBe("What is the contributor's GitHub username?");
    expect(usernamePrompt.validate('')).toBe('Username not provided');
    expect(usernamePrompt.validate('new-user')).toBe(true);

    const contributionsPrompt = prompts.checkbox.mock.calls[0][0];
    expect(contributionsPrompt.message).toBe('What are the contribution types?');
    expect(contributionsPrompt.validate([])).toBe(
      'Use space to select at least one contribution type.',
    );
    expect(contributionsPrompt.validate(['code'])).toBe(true);
  });

  it('rejects selecting the same contributions the user already has', async () => {
    const options = fixtures();
    options.contributors[0].contributions = ['code', 'doc'];
    prompts.input.mockResolvedValueOnce('jfmengels');

    await prompt(options);

    const contributionsPrompt = prompts.checkbox.mock.calls[0][0];
    expect(contributionsPrompt.default).toEqual(['code', 'doc']);
    expect(contributionsPrompt.validate(['doc', 'code'])).toBe(
      'Nothing changed, use space to select contribution types.',
    );
  });
});
