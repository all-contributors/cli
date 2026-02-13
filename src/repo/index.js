import * as githubAPI from './github.js'
import * as gitlabAPI from './gitlab.js'

const privateToken =
  (process.env &&
    (process.env.ALL_CONTRIBUTORS_PRIVATE_TOKEN ||
      process.env.PRIVATE_TOKEN)) ||
  ''
const SUPPORTED_REPO_TYPES = {
  github: {
    value: 'github',
    name: 'GitHub',
    checkKey: 'login',
    defaultHost: 'https://github.com',
    linkToCommits:
      '<%= options.repoHost || "https://github.com" %>/<%= options.projectOwner %>/<%= options.projectName %>/commits?author=<%= contributor.login %>',
    linkToIssues:
      '<%= options.repoHost || "https://github.com" %>/<%= options.projectOwner %>/<%= options.projectName %>/issues?q=author%3A<%= contributor.login %>',
    linkToReviews:
      '<%= options.repoHost || "https://github.com" %>/<%= options.projectOwner %>/<%= options.projectName %>/pulls?q=is%3Apr+reviewed-by%3A<%= contributor.login %>',
    getUserInfo: githubAPI.getUserInfo,
    getContributors: githubAPI.getContributors,
  },
  gitlab: {
    value: 'gitlab',
    name: 'GitLab',
    checkKey: 'name',
    defaultHost: 'https://gitlab.com',
    linkToCommits:
      '<%= options.repoHost || "https://gitlab.com" %>/<%= options.projectOwner %>/<%= options.projectName %>/commits/master',
    linkToIssues:
      '<%= options.repoHost || "https://gitlab.com" %>/<%= options.projectOwner %>/<%= options.projectName %>/issues?author_username=<%= contributor.login %>',
    linkToReviews:
      '<%= options.repoHost || "https://gitlab.com" %>/<%= options.projectOwner %>/<%= options.projectName %>/merge_requests?scope=all&state=all&approver_usernames[]=<%= contributor.login %>',
    getUserInfo: gitlabAPI.getUserInfo,
    getContributors: gitlabAPI.getContributors,
  },
}

export const getChoices = function () {
  return Object.keys(SUPPORTED_REPO_TYPES)
    .map(key => SUPPORTED_REPO_TYPES[key])
    .map(item => {
      return {
        value: item.value,
        name: item.name,
      }
    })
}

export const getHostname = function (repoType, repoHost) {
  if (repoHost) {
    return repoHost
  } else if (repoType in SUPPORTED_REPO_TYPES) {
    return SUPPORTED_REPO_TYPES[repoType].defaultHost
  }
  return null
}

export const getCheckKey = function (repoType) {
  if (repoType in SUPPORTED_REPO_TYPES) {
    return SUPPORTED_REPO_TYPES[repoType].checkKey
  }
  return null
}

export const getTypeName = function (repoType) {
  if (repoType in SUPPORTED_REPO_TYPES) {
    return SUPPORTED_REPO_TYPES[repoType].name
  }
  return null
}

export const getLinkToCommits = function (repoType) {
  if (repoType in SUPPORTED_REPO_TYPES) {
    return SUPPORTED_REPO_TYPES[repoType].linkToCommits
  }
  return null
}

export const getLinkToIssues = function (repoType) {
  if (repoType in SUPPORTED_REPO_TYPES) {
    return SUPPORTED_REPO_TYPES[repoType].linkToIssues
  }
  return null
}

export const getLinkToReviews = function (repoType) {
  if (repoType in SUPPORTED_REPO_TYPES) {
    return SUPPORTED_REPO_TYPES[repoType].linkToReviews
  }
  return null
}

export const getUserInfo = function (username, repoType, repoHost) {
  if (repoType in SUPPORTED_REPO_TYPES) {
    return SUPPORTED_REPO_TYPES[repoType].getUserInfo(
      username,
      getHostname(repoType, repoHost),
      privateToken,
    )
  }
  return null
}

export const getContributors = function (owner, name, repoType, repoHost) {
  if (repoType in SUPPORTED_REPO_TYPES) {
    return SUPPORTED_REPO_TYPES[repoType].getContributors(
      owner,
      name,
      getHostname(repoType, repoHost),
      privateToken,
    )
  }
  return null
}
