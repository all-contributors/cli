const {join} = require('path')
const {existsSync} = require('fs')
const {writeFile, readFile} = require('fs/promises')
const nyc = require('name-your-contributors')
const {Spinner} = require('clui')

const privateToken =
  process.env?.PRIVATE_TOKEN ?? process.env?.GITHUB_TOKEN ?? ''
const loader = new Spinner('Loading...')

const getContributors = async function (owner, name, cacheResult = false) {
  loader.start()

  const options = {
    token: privateToken,
    user: owner,
    repo: name,
    commits: true,
  }

  if (cacheResult) {
    const nycOutputPath = join(__dirname, './nyc-output.json')
    if (existsSync(nycOutputPath)) {
      const contributors = await readFile(nycOutputPath)
      loader.stop()
      return JSON.parse(contributors)
    } else {
      loader.message('Getting repo contributors...')
      const contributors = await nyc.repoContributors(options)
      await writeFile(nycOutputPath, JSON.stringify(contributors, null, 2))
      loader.stop()
      return contributors
    }
  } else {
    const contributors = await nyc.repoContributors(options)

    loader.stop()

    return contributors
  }
}

module.exports = {getContributors}
