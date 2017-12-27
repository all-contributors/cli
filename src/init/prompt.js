const _ = require('lodash/fp')
const inquirer = require('inquirer')
const git = require('../util').git

const questions = [
  {
    type: 'input',
    name: 'projectName',
    message: "What's the name of the repository?",
  },
  {
    type: 'input',
    name: 'projectOwner',
    message: 'Who is the owner of the repository?',
  },
  {
    type: 'input',
    name: 'contributorFile',
    message: 'In which file should contributors be listed?',
    default: 'README.md',
  },
  {
    type: 'confirm',
    name: 'needBadge',
    message: 'Do you want a badge tallying the number of contributors?',
  },
  {
    type: 'input',
    name: 'badgeFile',
    message: 'In which file should the badge be shown?',
    when: function(answers) {
      return answers.needBadge
    },
    default: function(answers) {
      return answers.contributorFile
    },
  },
  {
    type: 'input',
    name: 'imageSize',
    message: 'How big should the avatars be? (in px)',
    filter: parseInt,
    default: 100,
  },
  {
    type: 'confirm',
    name: 'commit',
    message:
      'Do you want this badge to auto-commit when contributors are added?',
    default: true,
  },
]

const uniqueFiles = _.flow(_.compact, _.uniq)

function createConfig(answers) {
  const projectName = _.trim(answers.projectName)
  const projectOwner = _.trim(answers.projectOwner)
  if (projectName === '') {
    throw new Error('Project name is not set, please re run `init`')
  } else if (projectOwner === '') {
    throw new Error('Project Owner is not set, please re run `init`')
  }
  return {
    config: {
      projectName,
      projectOwner,
      files: uniqueFiles([answers.contributorFile, answers.badgeFile]),
      imageSize: answers.imageSize,
      commit: answers.commit,
      contributors: [],
    },
    contributorFile: answers.contributorFile,
    badgeFile: answers.badgeFile,
  }
}

module.exports = function prompt() {
  return git
    .getRepoInfo()
    .then(repoInfo => {
      if (repoInfo) {
        questions[0].default = repoInfo.projectName
        questions[1].default = repoInfo.projectOwner
      }
      return inquirer.prompt(questions)
    })
    .then(answers => createConfig(answers))
}
