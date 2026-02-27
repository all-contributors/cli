import path from 'path'
import {exec} from 'child_process'
import {promisify} from 'util'
import {conventions} from '../init/commit-conventions.js'
import * as util from '../util/index.js'

const commitTemplate =
  '<%= prefix %> <%= (newContributor ? "Add" : "Update") %> @<%= username %> as a contributor'

const getRemoteOriginData = async () => {
  const execAsync = promisify(exec)
  const {stdout} = await execAsync('git config --get remote.origin.url')
  return stdout
}

function parse(originUrl) {
  const result = /[:\/]([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)(?:\.git)?/.exec(originUrl)
  if (!result) {
    return null
  }

  return {
    projectOwner: result[1],
    projectName: result[2],
  }
}

export function getRepoInfo() {
  return getRemoteOriginData().then(parse)
}

const spawnGitCommand = async (args) => {
  try {
    await promisify(exec)(`git ${args.join(' ')}`)
  } catch (error) {
    const msg = error.stderr || `git ${args.join(' ')} - exit code: ${error.code}`
    throw new Error(msg)
  }
}

export async function commit(options, data) {
  const files = options.files.concat(options.config)
  const absolutePathFiles = files.map(file => {
    return path.resolve(process.cwd(), file)
  })
  const commitConvention = conventions[options.commitConvention]

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
