import { confirm, input, select } from '@inquirer/prompts';

import { git } from '../util/index.js';
import { conventions } from './commit-conventions.js';

function uniqueFiles(files) {
  return [...new Set(files.filter(Boolean))];
}

export async function createPrompts(repoInfo) {
  const projectName = await input({
    message: "What's the name of the repository?",
    default: repoInfo?.projectName,
  });
  const projectOwner = await input({
    message: 'Who is the owner of the repository?',
    default: repoInfo?.projectOwner,
  });
  const repoType = await select({
    message: 'What is the repository type?',
    choices: [
      { name: 'GitHub', value: 'github' },
      { name: 'GitLab', value: 'gitlab' },
    ],
    default: 'github',
  });
  const repoHost = await input({
    message: "Where is the repository hosted? Hit Enter if it's on GitHub or GitLab",
    default: repoType === 'gitlab' ? 'https://gitlab.com' : 'https://github.com',
  });
  const contributorFile = await input({
    message: 'In which file should contributors be listed?',
    default: 'README.md',
  });
  const needBadge = await confirm({
    message: 'Do you want a badge tallying the number of contributors?',
  });
  const badgeFile = needBadge
    ? await input({
        message: 'In which file should the badge be shown?',
        default: contributorFile,
      })
    : undefined;
  const imageSize = await input({
    message: 'How big should the avatars be? (in px)',
    default: '100',
  });
  const commit = await confirm({
    message: 'Do you want this badge to auto-commit when contributors are added?',
    default: true,
  });
  const commitConvention = await select({
    message: 'What commit convention would you want it to use?',
    choices: Object.entries(conventions).map(([value, convention]) => ({
      name: convention.name,
      value,
    })),
    default: 'angular',
  });
  const linkToUsage = await confirm({
    message: 'Do you want to add a footer with link to usage?',
    default: true,
  });

  return {
    config: {
      projectName,
      projectOwner,
      repoType,
      repoHost,
      files: uniqueFiles([contributorFile, badgeFile]),
      imageSize: parseInt(imageSize, 10),
      commit,
      commitConvention,
      contributors: [],
      contributorsPerLine: 7,
      linkToUsage,
    },
    contributorFile,
    badgeFile,
  };
}

export async function prompt() {
  const repoInfo = await git.getRepoInfo();
  return createPrompts(repoInfo);
}
