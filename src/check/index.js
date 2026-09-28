import path from 'path'
import {promises as fs} from 'fs'
import * as YoctoColors from 'yoctocolors'
import * as repo from '../repo/index.js'

export async function getIgnoredContributors(argv = {}, cwd = process.cwd()) {
  const ignored = new Set(
    (Array.isArray(argv.ignoredContributors)
      ? argv.ignoredContributors
      : []
    ).map(name => String(name).toLowerCase()),
  )

  const ignoreFiles = [
    path.join(cwd, '.all-contributorsrc-ignore'),
    path.join(cwd, '.all-contributors-ignore'),
  ]

  for (const file of ignoreFiles) {
    try {
      const content = await fs.readFile(file, 'utf8')
      content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .forEach(name => ignored.add(name.toLowerCase()))
    } catch {
      // ignore missing file
    }
  }

  return ignored
}

export async function checkContributors(
  argv,
  cwd = process.cwd(),
  out = process.stdout,
) {
  const repoContributors = await repo.getContributors(
    argv.projectOwner,
    argv.projectName,
    argv.repoType,
    argv.repoHost,
  )

  const checkKey = repo.getCheckKey(argv.repoType)
  const knownContributions = (argv.contributors || []).reduce((obj, item) => {
    obj[item[checkKey]] = item.contributions
    return obj
  }, {})
  const knownContributors = (argv.contributors || []).map(
    contributor => contributor[checkKey],
  )

  const ignoredContributors = await getIgnoredContributors(argv, cwd)

  const missingInConfig = repoContributors.filter(
    key =>
      !knownContributors.includes(key) &&
      !ignoredContributors.has(key.toLowerCase()),
  )
  const missingFromRepo = knownContributors.filter(key => {
    return (
      !repoContributors.includes(key) &&
      (knownContributions[key].includes('code') ||
        knownContributions[key].includes('test'))
    )
  })

  if (missingInConfig.length) {
    out.write(
      YoctoColors.bold('Missing contributors in .all-contributorsrc:\n'),
    )
    out.write(`${missingInConfig.join(', ')}\n`)
  }

  if (missingFromRepo.length) {
    out.write('\n')
    out.write(
      YoctoColors.bold('Unknown contributors found in .all-contributorsrc:\n'),
    )
    out.write(`${missingFromRepo.join(', ')}\n`)
  }

  return {missingInConfig, missingFromRepo}
}
