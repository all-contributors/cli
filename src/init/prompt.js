import { confirm, isCancel, select, text } from '@clack/prompts';

import { git } from '../util/index.js';
import { conventions } from './commit-conventions.js';

function uniqueFiles(files) {
  return [...new Set(files.filter(Boolean))];
}

export async function createPrompts(repoInfo) {
  const projectName = await text({
    message: "What's the name of the repository?",
    initialValue: repoInfo?.projectName,
  });
  if (isCancel(projectName)) {
    return undefined;
  }

  const projectOwner = await text({
    message: 'Who is the owner of the repository?',
    initialValue: repoInfo?.projectOwner,
  });
  if (isCancel(projectOwner)) {
    return undefined;
  }

  const repoType = await select({
    message: 'What is the repository type?',
    options: [
      { label: 'GitHub', value: 'github' },
      { label: 'GitLab', value: 'gitlab' },
    ],
    initialValue: 'github',
  });
  if (isCancel(repoType)) {
    return undefined;
  }

  const repoHost = await text({
    message: "Where is the repository hosted? Hit Enter if it's on GitHub or GitLab",
    initialValue: repoType === 'gitlab' ? 'https://gitlab.com' : 'https://github.com',
  });
  if (isCancel(repoHost)) {
    return undefined;
  }

  const contributorFile = await text({
    message: 'In which file should contributors be listed?',
    initialValue: 'README.md',
  });
  if (isCancel(contributorFile)) {
    return undefined;
  }

  const needBadge = await confirm({
    message: 'Do you want a badge tallying the number of contributors?',
  });
  if (isCancel(needBadge)) {
    return undefined;
  }

  const badgeFile = needBadge
    ? await text({
        message: 'In which file should the badge be shown?',
        initialValue: contributorFile,
      })
    : undefined;
  if (isCancel(badgeFile)) {
    return undefined;
  }

  const imageSize = await text({
    message: 'How big should the avatars be? (in px)',
    initialValue: '100',
  });
  if (isCancel(imageSize)) {
    return undefined;
  }

  const commit = await confirm({
    message: 'Do you want this badge to auto-commit when contributors are added?',
    initialValue: true,
  });
  if (isCancel(commit)) {
    return undefined;
  }

  const commitConvention = await select({
    message: 'What commit convention would you want it to use?',
    options: Object.entries(conventions).map(([value, convention]) => ({
      label: convention.name,
      value,
    })),
    initialValue: 'angular',
  });
  if (isCancel(commitConvention)) {
    return undefined;
  }

  const linkToUsage = await confirm({
    message: 'Do you want to add a footer with link to usage?',
    initialValue: true,
  });
  if (isCancel(linkToUsage)) {
    return undefined;
  }

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
