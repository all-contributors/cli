<h1 align="center">
  all-contributors-cli 🤖
</h1>
<p align="center" style="font-size: 1.2rem;">Automate acknowledging contributors to your open source projects</p>

<hr />

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package] [![downloads][downloads-badge]][downloads]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs] [![Code of Conduct][coc-badge]][coc]
[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

## The problem

You want to implement the [All Contributors][all-contributors] spec, but don't
want to maintain the table by hand

## This solution

This is a tool to help automate adding contributor acknowledgements according to
the [all-contributors](https://github.com/kentcdodds/all-contributors)
specification for your GitHub or GitLab repository.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
  - [Generating the contributors list](#generating-the-contributors-list)
  - [Add/update contributors](#addupdate-contributors)
  - [Check for missing contributors](#check-for-missing-contributors)
- [Configuration](#configuration)
- [Contributors](#contributors)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev all-contributors-cli
```

Then init the project using `init` and answer a few questions:

```console
# Use npx for npm@^5.2.0
npx all-contributors init
# Or directly execute the bin
./node_modules/.bin/all-contributors init
```

Then you can add these scripts to your `package.json`:

```json
{
  "scripts": {
    "contributors:add": "all-contributors add",
    "contributors:generate": "all-contributors generate"
  }
}
```

and use them via `npm run`:

```console
npm run contributors:add -- jfmengels doc
npm run contributors:generate
```

## Usage

A quick note: We recommend that you install `all-contributors-cli` as a dependency in your project.
If you do that then you can run the `all-contributors` binary from within your `package.json` scripts, or you can run it in your terminal with `npx all-contributors`.
Below we'll just show `all-contributors` to keep things simple, but if you're having any difficulties, then give the `npx all-contributors-cli` route a try :smiley_cat:

### Generating the contributors list

Please add following placeholders in [`files`](#configuration) to specify the generation area first.

<pre>
&lt;!-- ALL-CONTRIBUTORS-<!-- hack break -->LIST:START - Do not remove or modify this section --&gt;
&lt;!-- ALL-CONTRIBUTORS-<!-- hack break -->LIST:END --&gt;
</pre>

Then use `generate` to generate the contributors list and inject it into your
contributors file. Contributors will be read from your configuration file.

```console
all-contributors generate
```

### Add/update contributors

Use `add` to add new contributors to your project, or add new ways in which they
have contributed. They will be added to your configuration file, and the
contributors file will be updated just as if you used the `generate` command.

```console
# Add new contributor <username>, who made a contribution of type <contribution>
all-contributors add <username> <contribution>
# Example:
all-contributors add jfmengels code,doc
```

Where `username` is the user's GitHub or Gitlab username, and `contribution` is a
`,`-separated list of ways to contribute, from the following list
([see the specs](https://github.com/kentcdodds/all-contributors#emoji-key)):

- blog: [📝](# 'Blogposts')
- bug: [🐛](# 'Bug reports')
- code: [💻](# 'Code')
- design: [🎨](# 'Design')
- doc: [📖](# 'Documentation')
- eventOrganizing: [📋](# 'Event Organizing')
- example: [💡](# 'Examples')
- financial: [💵](# 'Financial')
- fundingFinding: [🔍](# 'Funding Finding')
- ideas: [🤔](# 'Ideas, Planning, & Feedback')
- infra: [🚇](# 'Infrastructure (Hosting, Build-Tools, etc)')
- platform: [📦](# 'Packaging/porting to new platform')
- plugin: [🔌](# 'Plugin/utility libraries')
- question: [💬](# 'Answering Questions')
- review: [👀](# 'Reviewed Pull Requests')
- talk: [📢](# 'Talks')
- test: [⚠️](# 'Tests')
- tool: [🔧](# 'Tools')
- translation: [🌍](# 'Translation')
- tutorial: [✅](# 'Tutorials')
- video: [📹](# 'Videos')

Please note that if you are using a self-hosted gitlab instance, before adding
contributor, you need to set an environment variable named `PRIVATE_TOKEN` first.

> Private token is the personal access token to authenticate with the GitLab API.

```console
# set private token on linux
export PRIVATE_TOKEN=your_private_token
# set private token on windows
set PRIVATE_TOKEN=your_private_token
```

### Check for missing contributors

Use `check` to compare contributors from GitHub with the ones credited in your
`.all-contributorsrc` file, in order to make sure that credit is given where
it's due.

```console
all-contributors check
```

> Due to GitHub API restrictions, this command only works for projects with less
> than 500 contributors. (Unless you set a PRIVATE_TOKEN) as mentioned below

## Configuration

You can configure the project by updating the `.all-contributorsrc` JSON file.
The data used to generate the contributors list will be stored in there, and you
can configure how you want `all-contributors-cli` to generate the list.

These are the keys you can specify:

| Option                | Description                                                                                         | Example/Default                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `projectName`         | Mandatory, name of the project.                                                                     | Example: `all-contributors-cli`                                                                             |
| `projectOwner`        | Mandatory, name of the user the project is hosted by.                                               | Example: `jfmengels`                                                                                        |
| `repoType`            | Type of repository. Must be either `github` or `gitlab`.                                            | Default: `github`                                                                                           |
| `repoHost`            | Points to the repository hostname. Change it if you use a self-hosted repository.                   | Default: `https://github.com` if `repoType` is `github`, and `https://gitlab.com` if `repoType` is `gitlab` |
| `files`               | Array of files to update.                                                                           | Default: `['README.md']`                                                                                    |
| `imageSize`           | Size (in px) of the user's avatar.                                                                  | Default: `100`                                                                                              |
| `commit`              | Auto-commit badge when adding contributors.                                                         | `true` or `false`                                                                                           |
| `contributorsPerLine` | Maximum number of columns for the contributors table.                                               | Default: `7`                                                                                                |
| `badgeTemplate`       | Define your own lodash template to generate the badge.                                              |
| `contributorTemplate` | Define your own lodash template to generate the contributor.                                        |
| `types`               | Specify custom symbols or link templates for contribution types. Can override the documented types. |

```json
{
  "projectName": "all-contributors-cli",
  "projectOwner": "jfmengels",
  "repoType": "github",
  "repoHost": "https://github.com",
  "files": ["README.md"],
  "imageSize": 100,
  "commit": false,
  "contributorsPerLine": 7,
  "badgeTemplate": "[![All Contributors](https://img.shields.io/badge/all_contributors-<%= contributors.length %>-orange.svg?style=flat-square)](#contributors)",
  "contributorTemplate": "<%= avatarBlock %><br /><%= contributions %>",
  "types": {
    "custom": {
      "symbol": "🔭",
      "description": "A custom contribution type.",
      "link": "[<%= symbol %>](<%= url %> \"<%= description %>\"),"
    }
  },
  "contributors": []
}
```

In some cases you may see the error message 'GitHub API rate limit exceeded for xxx'. You may need to set an environment variable named `PRIVATE_TOKEN` in order to circumvent this rate-limiting.

> Private token is your personal access token to authenticate with the GitHub API.


## Contributors

Thanks goes to these wonderful people
([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the
[all-contributors](https://github.com/kentcdodds/all-contributors)
specification. Contributions of any kind are welcome!

## LICENSE

MIT

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/jfmengels/all-contributors-cli.svg?style=flat-square
[build]: https://travis-ci.org/jfmengels/all-contributors-cli
[coverage-badge]: https://img.shields.io/codecov/c/github/jfmengels/all-contributors-cli.svg?style=flat-square
[coverage]: https://codecov.io/github/jfmengels/all-contributors-cli
[version-badge]: https://img.shields.io/npm/v/all-contributors-cli.svg?style=flat-square
[package]: https://www.npmjs.com/package/all-contributors-cli
[downloads-badge]: https://img.shields.io/npm/dm/all-contributors-cli.svg?style=flat-square
[downloads]: http://www.npmtrends.com/all-contributors-cli
[license-badge]: https://img.shields.io/npm/l/all-contributors-cli.svg?style=flat-square
[license]: https://github.com/jfmengels/all-contributors-cli/blob/master/other/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/jfmengels/all-contributors-cli/blob/master/other/CODE_OF_CONDUCT.md
[github-watch-badge]: https://img.shields.io/github/watchers/jfmengels/all-contributors-cli.svg?style=social
[github-watch]: https://github.com/jfmengels/all-contributors-cli/watchers
[github-star-badge]: https://img.shields.io/github/stars/jfmengels/all-contributors-cli.svg?style=social
[github-star]: https://github.com/jfmengels/all-contributors-cli/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20all-contributors-cli!%20https://github.com/jfmengels/all-contributors-cli%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/jfmengels/all-contributors-cli.svg?style=social
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
