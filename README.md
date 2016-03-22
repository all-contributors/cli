# all-contributors-cli

[![version](https://img.shields.io/npm/v/all-contributors-cli.svg)](http://npm.im/all-contributors-cli)[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)

This is a tool to help automate adding contributor acknowledgements according to the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.

## Installation

You can install it via `npm`:
```console
npm install all-contributors-cli -g
```
Then init the project using `init` and answering a few questions:
```console
all-contributors init
```
Once initialized, you don't need to have  `all-contributors-cli` installed globally. You can instead save it as a devDependency of your project and add it to your `package.json` scripts:
```console
npm install --save-dev all-contributors-cli
```
```json
{
  "scripts": {
    "add": "all-contributors add",
    "generate": "all-contributors generate"
  }
}
```
and use them via `npm run`:
```console
npm run add -- jfmengels doc
npm run generate
```

## Usage

### Generating the contributors list

Use `generate` to generate the contributors list and inject it into your contributors file. Contributors will be read from your configuration file.

```console
all-contributors generate
```

### Add/update contributors

Use `add` to add new contributors to your project, or add new ways in which they contributed. They will be added to your configuration file. The contributors file will then be updated just as if you used the `generate` command.

```console
# Add new contributor <username>, who made a contribution of type <contribution>
all-contributors add <username> <contribution>
# Example:
all-contributors add jfmengels code,doc
```
Where `username` is the user's GitHub username, and `contribution` is a `,`-separated list of ways to contribute, from the following list ([see the specs](https://github.com/kentcdodds/all-contributors#emoji-key)):
  - code: 💻
  - plugin: 🔌
  - tool: 🔧
  - doc: 📖
  - question: ❓
  - test: ⚠️
  - bug: 🐛
  - example: 💡
  - blog: 📝
  - tutorial: ✅
  - translate: 🌍
  - video: 📹
  - talk: 📢
  - design: 🎨
  - review: 👀

## Configuration

You can configure the project by updating the `.all-contributorsrc` JSON file. The data used to generate the contributors list will be stored in here, and you can configure how you want `all-contributors-cli` to generate the list.

These are the keys you can specify:
- `files`: Array of files to update. Default: `['README.md']`
- `projectOwner`: Name of the user the project is hosted by. Example: `jfmengels/all-contributor-cli` --> `jfmengels`. Mandatory.
- `projectName`: Name of the project. Example: `jfmengels/all-contributor-cli` --> `all-contributor-cli`. Mandatory.
- `types`: Specify custom symbols or link templates for contribution types. Can override the documented types.
- `imageSize`: Size (in px) of the user's avatar. Default: `100`.
- `contributorsPerLine`: Maximum number of columns for the contributors table. Default: `7`.
- `contributorTemplate`: Define your own template to generate the contributor list.
- `badgeTemplate`: Define your own template to generate the badge.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [![Jeroen Engels](https://avatars.githubusercontent.com/u/3869412?v=3&s=100)<br /><sub>Jeroen Engels</sub>](https://github.com/jfmengels)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=jfmengels) [📖](https://github.com/jfmengels/all-contributors-cli/commits?author=jfmengels) [⚠️](https://github.com/jfmengels/all-contributors-cli/commits?author=jfmengels) | [![Kent C. Dodds](https://avatars.githubusercontent.com/u/1500684?v=3&s=100)<br /><sub>Kent C. Dodds</sub>](http://kentcdodds.com/)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=kentcdodds) |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.
Contributions of any kind welcome!

## LICENSE

MIT
