# all-contributors-cli

This is a tool to help automate adding contributor acknowledgements according to the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.

## Installation

You can install it via `npm`:
```
npm install all-contributors-cli
```

## Usage

```
# Add new contributor <username>, who made a contribution of type <contribution>
all-contributors add <username> <contribution>
# Example:
all-contributors add jfmengels code,doc
```
Where:
- `username` is the user's GitHub username
- `contribution` is a `,`-separated list of ways to contribute, from the following list ([see the specs](https://github.com/kentcdodds/all-contributors#emoji-key)):
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
  - video: 📹
  - talk: 📢
  - design: 🎨
  - review: 👀

## Configuration

You can configure the project by creating a `.all-contributorsrc` JSON file.

```json
{
  "file": "README.md",
  "owner": "jfmengels",
  "emoji": {
    "cheerful": ":smiley:"
  }
}
```
or creating a `all-contributors` updating the `package.json` file:

```json
{
  "name": "all-contributors-cli",
  "...": "...",
  "all-contributors": {
    "file": "README.md",
    "owner": "jfmengels"
  }
}
```

These are the keys you can specify:
- `emoji`: Specify custom emoji, can override the documented emojis. It doesn't really have to be emojis really.
- `file`: File to write the list of contributors in. Default: 'README.md'
- `imageSize`: Size (in px) of the user's avatar. Default: 100.
- `owner`: Name of the user the project is hosted by. Example: `jfmengels/all-contributor-cli` --> `jfmengels`. By default will be parsed from the repo's homepage in `package.json` (TODO).
- `project`: Name of the project. Example: `jfmengels/all-contributor-cli` --> `all-contributor-cli`. Default: Name of the project written in the `package.json` file (TODO).
- `template`: Define your own contributor template. Please read the code to see what you can define (**warning**: not sure it will work well after several tries).


## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

Contributor | Contributions
:---: | :---:
[![Jeroen Engels](https://avatars.githubusercontent.com/u/3869412?v=3&s=100)<br />Jeroen Engels](https://github.com/jfmengels) | [💻📖⚠️](https://github.com/jfmengels/all-contributors-cli/commits?author=jfmengels)

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.
Contributions of any kind welcome!

## LICENSE

MIT
