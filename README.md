<h1 align="center">
  all-contributors-cli 🤖
</h1>
<p align="center" style="font-size: 1.2rem;">Automate acknowledging contributors to your open source projects</p>

<hr />

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package] [![downloads][downloads-badge]][downloads]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-21-orange.svg?style=flat-square)](#contributors)
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

### Generating the contributors list

Use `generate` to generate the contributors list and inject it into your
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

* blog: [📝](# "Blogposts")
* bug: [🐛](# "Bug reports")
* code: [💻](# "Code")
* design: [🎨](# "Design")
* doc: [📖](# "Documentation")
* eventOrganizing: [📋](# "Event Organizing")
* example: [💡](# "Examples")
* financial: [💵](# "Financial")
* fundingFinding: [🔍](# "Funding Finding")
* ideas: [🤔](# "Ideas, Planning, & Feedback")
* infra: [🚇](# "Infrastructure (Hosting, Build-Tools, etc)")
* platform: [📦](# "Packaging/porting to new platform")
* plugin: [🔌](# "Plugin/utility libraries")
* question: [💬](# "Answering Questions")
* review: [👀](# "Reviewed Pull Requests")
* talk: [📢](# "Talks")
* test: [⚠️](# "Tests")
* tool: [🔧](# "Tools")
* translation: [🌍](# "Translation")
* tutorial: [✅](# "Tutorials")
* video: [📹](# "Videos")

### Check for missing contributors

Use `check` to compare contributors from GitHub with the ones credited in your
`.all-contributorsrc` file, in order to make sure that credit is given where
it's due.

```console
all-contributors check
```

> Due to GitHub API restrictions, this command only works for projects with less
> than 500 contributors.

## Configuration

You can configure the project by updating the `.all-contributorsrc` JSON file.
The data used to generate the contributors list will be stored in there, and you
can configure how you want `all-contributors-cli` to generate the list.

These are the keys you can specify:

* `files`: Array of files to update. Default: `['README.md']`
* `projectOwner`: Name of the user the project is hosted by. Example:
  `jfmengels/all-contributors-cli` --> `jfmengels`. Mandatory.
* `projectName`: Name of the project. Example: `jfmengels/all-contributors-cli`
  --> `all-contributors-cli`. Mandatory.
* `repoType`: Type of repository. Must be either `github` or `gitlab`. Default: `github`.
* `repoHost`: Points to the repository hostname. Change it if you use a self hosted repository. Default: `https://github.com` if `repoType` is `github`, and `https://gitlab.com` if `repoType` is `gitlab`.
* `types`: Specify custom symbols or link templates for contribution types. Can
  override the documented types.
* `imageSize`: Size (in px) of the user's avatar. Default: `100`.
* `contributorsPerLine`: Maximum number of columns for the contributors table.
  Default: `7`.
* `contributorTemplate`: Define your own template to generate the contributor
  list.
* `badgeTemplate`: Define your own template to generate the badge.

## Contributors

Thanks goes to these wonderful people
([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars.githubusercontent.com/u/3869412?v=3" width="100px;"/><br /><sub><b>Jeroen Engels</b></sub>](https://github.com/jfmengels)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=jfmengels "Code") [📖](https://github.com/jfmengels/all-contributors-cli/commits?author=jfmengels "Documentation") [⚠️](https://github.com/jfmengels/all-contributors-cli/commits?author=jfmengels "Tests") | [<img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;"/><br /><sub><b>Kent C. Dodds</b></sub>](http://kentcdodds.com/)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=kentcdodds "Documentation") [💻](https://github.com/jfmengels/all-contributors-cli/commits?author=kentcdodds "Code") | [<img src="https://avatars.githubusercontent.com/u/14871650?v=3" width="100px;"/><br /><sub><b>João Guimarães</b></sub>](https://github.com/jccguimaraes)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=jccguimaraes "Code") | [<img src="https://avatars.githubusercontent.com/u/1282980?v=3" width="100px;"/><br /><sub><b>Ben Briggs</b></sub>](http://beneb.info)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=ben-eb "Code") | [<img src="https://avatars.githubusercontent.com/u/22768990?v=3" width="100px;"/><br /><sub><b>Itai Steinherz</b></sub>](https://github.com/itaisteinherz)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=itaisteinherz "Documentation") [💻](https://github.com/jfmengels/all-contributors-cli/commits?author=itaisteinherz "Code") | [<img src="https://avatars.githubusercontent.com/u/5701162?v=3" width="100px;"/><br /><sub><b>Alex Jover</b></sub>](https://github.com/alexjoverm)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=alexjoverm "Code") [📖](https://github.com/jfmengels/all-contributors-cli/commits?author=alexjoverm "Documentation") |
| :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars3.githubusercontent.com/u/8212?v=3" width="100px;"/><br /><sub><b>Jerod Santo</b></sub>](https://jerodsanto.net)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=jerodsanto "Code") | [<img src="https://avatars1.githubusercontent.com/u/574871?v=3" width="100px;"/><br /><sub><b>Kevin Jalbert</b></sub>](https://github.com/kevinjalbert)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=kevinjalbert "Code") | [<img src="https://avatars3.githubusercontent.com/u/5038030?v=4" width="100px;"/><br /><sub><b>tunnckoCore</b></sub>](https://i.am.charlike.online)<br />[🔧](#tool-charlike "Tools") | [<img src="https://avatars2.githubusercontent.com/u/304450?v=4" width="100px;"/><br /><sub><b>Mehdi Achour</b></sub>](https://machour.idk.tn/)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=machour "Code") | [<img src="https://avatars1.githubusercontent.com/u/8344688?v=4" width="100px;"/><br /><sub><b>Roy Revelt</b></sub>](https://codsen.com)<br />[🐛](https://github.com/jfmengels/all-contributors-cli/issues?q=author%3Arevelt "Bug reports") | [<img src="https://avatars1.githubusercontent.com/u/422331?v=4" width="100px;"/><br /><sub><b>Chris Vickery</b></sub>](https://github.com/chrisinajar)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=chrisinajar "Code") |
| [<img src="https://avatars2.githubusercontent.com/u/1026002?v=4" width="100px;"/><br /><sub><b>Bryce Reynolds</b></sub>](https://github.com/brycereynolds)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=brycereynolds "Code") | [<img src="https://avatars3.githubusercontent.com/u/2322305?v=4" width="100px;"/><br /><sub><b>James, please</b></sub>](http://www.jmeas.com)<br />[🤔](#ideas-jmeas "Ideas, Planning, & Feedback") [💻](https://github.com/jfmengels/all-contributors-cli/commits?author=jmeas "Code") | [<img src="https://avatars3.githubusercontent.com/u/1057324?v=4" width="100px;"/><br /><sub><b>Spyros Ioakeimidis</b></sub>](http://www.spyros.io)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=spirosikmd "Code") | [<img src="https://avatars3.githubusercontent.com/u/12335761?v=4" width="100px;"/><br /><sub><b>Fernando Costa</b></sub>](https://github.com/fadc80)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=fadc80 "Code") | [<img src="https://avatars0.githubusercontent.com/u/197404?v=4" width="100px;"/><br /><sub><b>snipe</b></sub>](https://snipe.net)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=snipe "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/997157?v=4" width="100px;"/><br /><sub><b>Gant Laborde</b></sub>](http://gantlaborde.com/)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=GantMan "Code") |
| [<img src="https://avatars2.githubusercontent.com/u/17708702?v=4" width="100px;"/><br /><sub><b>Md Zubair Ahmed</b></sub>](https://in.linkedin.com/in/mzubairahmed)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=M-ZubairAhmed "Documentation") [🐛](https://github.com/jfmengels/all-contributors-cli/issues?q=author%3AM-ZubairAhmed "Bug reports") | [<img src="https://avatars3.githubusercontent.com/u/6177621?v=4" width="100px;"/><br /><sub><b>Divjot Singh</b></sub>](http://bogas04.github.io)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=bogas04 "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/15315098?v=4" width="100px;"/><br /><sub><b>João Marques</b></sub>](https://github.com/tigermarques)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=tigermarques "Code") [📖](https://github.com/jfmengels/all-contributors-cli/commits?author=tigermarques "Documentation") [🤔](#ideas-tigermarques "Ideas, Planning, & Feedback") |
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
