const path = require('path')
const spawn = require('child_process').spawn
const pify = require('pify')
const util = require('../util')
const conventions = require('../init/commit-conventions')
const {readConfig} = require('./config-file')

const commitTemplate =
  '<%= prefix %> <%= (newContributor ? "Add" : "Update") %> @<%= username %> as a contributor'

const getRemoteOriginData = pify(cb => {
  let output = ''
  const git = spawn('git', 'config --get remote.origin.url'.split(' '))
  git.stdout.on('data', data => {
    output += data
  })

  git.stderr.on('data', cb)
  git.on('close', () => {
    cb(null, output)
  })
})

function parse(originUrl) {
  const result = /:(\w+)\/([A-Za-z0-9-_]+)/.exec(originUrl)
  if (!result) {
    return null
  }

  return {
    projectOwner: result[1],
    projectName: result[2],
  }
}

function getRepoInfo() {
  return getRemoteOriginData().then(parse)
}

const spawnGitCommand = pify((args, cb) => {
  const git = spawn('git', args)
  const bufs = []
  git.stderr.on('data', buf => bufs.push(buf))
  git.on('close', code => {
    if (code) {
      const msg =
        Buffer.concat(bufs).toString() ||
        `git ${args.join(' ')} - exit code: ${code}`
      cb(new Error(msg))
    } else {
      cb(null)
    }
  })
})

async function commit(options, data) {
  const files = options.files.concat(options.config)
  const absolutePathFiles = files.map(file => {
    return path.resolve(process.cwd(), file)
  })
  const config = await readConfig(options.config)
  const commitConvention = conventions[config.commitConvention]

  return spawnGitCommand(['add'].concat(absolutePathFiles)).then(() => {
    let commitMessage = util.template(options.commitTemplate || commitTemplate)(
      {
        ...data,
        prefix: commitConvention.msg,
      },
    )
    if (commitConvention.lowercase) {
      commitMessage = commitConvention.transform(commitMessage)
    }
    return spawnGitCommand(['commit', '-m', commitMessage])
  })
}

module.exports = {
  commit,
  getRepoInfo,
}
