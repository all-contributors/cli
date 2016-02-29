# all-contributors-cli

This is a tool to help automate adding contributor acknowledgements according to the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.

## Usage

```
# Add new contributor <username>, who a contribution of type <contribution>
all-contributors <username> <contribution>
```
Where:
- `username` is the user's GitHub username
- `contribution` is a ','-separated list of ways to contribute, from the following list ([see the specs](https://github.com/kentcdodds/all-contributors#emoji-key)):
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
- `file`: File to write the list of contributors in. Default: 'README.md'
- `owner`: Name of the user the project is hosted by. Example: `jfmengels/all-contributor-cli` --> `jfmengels`. By default will be parsed from the repo's homepage in `package.json` (TODO).
- `project`: Name of the project. Default: Name of the project written in the `package.json` file (TODO).
- `imageSize`: Size (in px) of the user's avatar. Default: 100.
- `emoji`: Specify custom emoji, can override the documented emojis.
