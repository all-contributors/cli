# all-contributors-cli

[![version](https://img.shields.io/npm/v/all-contributors-cli.svg)](http://npm.im/all-contributors-cli)
[![All Contributors](https://img.shields.io/badge/all_contributors-11-orange.svg?style=flat-square)](#contributors)

This is a tool to help automate adding contributor acknowledgements according to the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.

## Installation

You can install it via `npm`:
```console
npm install all-contributors-cli -g
```
Then init the project using `init` and answer a few questions:
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

Use `add` to add new contributors to your project, or add new ways in which they have contributed. They will be added to your configuration file, and the contributors file will be updated just as if you used the `generate` command.

```console
# Add new contributor <username>, who made a contribution of type <contribution>
all-contributors add <username> <contribution>
# Example:
all-contributors add jfmengels code,doc
```
Where `username` is the user's GitHub username, and `contribution` is a `,`-separated list of ways to contribute, from the following list ([see the specs](https://github.com/kentcdodds/all-contributors#emoji-key)):
  - blog: [📝](# "Blogposts")
  - bug: [🐛](# "Bug reports")
  - code: [💻](# "Code")
  - design: [🎨](# "Design")
  - doc: [📖](# "Documentation")
  - eventOrganizing: [📋](# "Event Organizing")
  - example: [💡](# "Examples")
  - financial: [💵](# "Financial")
  - fundingFinding: [🔍](# "Funding Finding")
  - ideas: [🤔](# "Ideas, Planning, & Feedback")
  - infra: [🚇](# "Infrastructure (Hosting, Build-Tools, etc)")
  - plugin: [🔌](# "Plugin/utility libraries")
  - question: [💬](# "Answering Questions")
  - review: [👀](# "Reviewed Pull Requests")
  - talk: [📢](# "Talks")
  - test: [⚠️](# "Tests")
  - tool: [🔧](# "Tools")
  - translation: [🌍](# "Translation")
  - tutorial: [✅](# "Tutorials")
  - video: [📹](# "Videos")

## Configuration

You can configure the project by updating the `.all-contributorsrc` JSON file. The data used to generate the contributors list will be stored in there, and you can configure how you want `all-contributors-cli` to generate the list.

These are the keys you can specify:
- `files`: Array of files to update. Default: `['README.md']`
- `projectOwner`: Name of the user the project is hosted by. Example: `jfmengels/all-contributors-cli` --> `jfmengels`. Mandatory.
- `projectName`: Name of the project. Example: `jfmengels/all-contributors-cli` --> `all-contributors-cli`. Mandatory.
- `types`: Specify custom symbols or link templates for contribution types. Can override the documented types.
- `imageSize`: Size (in px) of the user's avatar. Default: `100`.
- `contributorsPerLine`: Maximum number of columns for the contributors table. Default: `7`.
- `contributorTemplate`: Define your own template to generate the contributor list.
- `badgeTemplate`: Define your own template to generate the badge.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars.githubusercontent.com/u/3869412?v=3" width="100px;"/><br /><sub><b>Jeroen Engels</b></sub>](https://github.com/jfmengels)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=jfmengels "Code") [📖](https://github.com/jfmengels/all-contributors-cli/commits?author=jfmengels "Documentation") [⚠️](https://github.com/jfmengels/all-contributors-cli/commits?author=jfmengels "Tests") | [<img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;"/><br /><sub><b>Kent C. Dodds</b></sub>](http://kentcdodds.com/)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=kentcdodds "Documentation") [💻](https://github.com/jfmengels/all-contributors-cli/commits?author=kentcdodds "Code") | [<img src="https://avatars.githubusercontent.com/u/14871650?v=3" width="100px;"/><br /><sub><b>João Guimarães</b></sub>](https://github.com/jccguimaraes)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=jccguimaraes "Code") | [<img src="https://avatars.githubusercontent.com/u/1282980?v=3" width="100px;"/><br /><sub><b>Ben Briggs</b></sub>](http://beneb.info)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=ben-eb "Code") | [<img src="https://avatars.githubusercontent.com/u/22768990?v=3" width="100px;"/><br /><sub><b>Itai Steinherz</b></sub>](https://github.com/itaisteinherz)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=itaisteinherz "Documentation") [💻](https://github.com/jfmengels/all-contributors-cli/commits?author=itaisteinherz "Code") | [<img src="https://avatars.githubusercontent.com/u/5701162?v=3" width="100px;"/><br /><sub><b>Alex Jover</b></sub>](https://github.com/alexjoverm)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=alexjoverm "Code") [📖](https://github.com/jfmengels/all-contributors-cli/commits?author=alexjoverm "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/8212?v=3" width="100px;"/><br /><sub><b>Jerod Santo</b></sub>](https://jerodsanto.net)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=jerodsanto "Code") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars1.githubusercontent.com/u/574871?v=3" width="100px;"/><br /><sub><b>Kevin Jalbert</b></sub>](https://github.com/kevinjalbert)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=kevinjalbert "Code") | [<img src="https://avatars3.githubusercontent.com/u/5038030?v=4" width="100px;"/><br /><sub><b>tunnckoCore</b></sub>](https://i.am.charlike.online)<br />[🔧](#tool-charlike "Tools") | [<img src="https://avatars2.githubusercontent.com/u/304450?v=4" width="100px;"/><br /><sub><b>Mehdi Achour</b></sub>](https://machour.idk.tn/)<br />[💻](https://github.com/jfmengels/all-contributors-cli/commits?author=machour "Code") | [<img src="https://avatars1.githubusercontent.com/u/8344688?v=4" width="100px;"/><br /><sub><b>Roy Revelt</b></sub>](https://codsen.com)<br />[🐛](https://github.com/jfmengels/all-contributors-cli/issues?q=author%3Arevelt "Bug reports") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.
Contributions of any kind are welcome!

## LICENSE

MIT
