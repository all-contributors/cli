// All Contributors Node JS API
// This is not yet ready for main-stream usage, API implementation may change at any time without warning
// This is to support adding contributors using the AllContributors GitHub Bot (see github.com/all-contributors/all-contributors-bot
// These Node API's are intended to be network and side effect free, everything should be in memory with no io to network/disk

import * as YoctoColors from 'yoctocolors'

import {addContributorWithDetails} from './contributors/addWithDetails.js'
import {generate} from './generate/index.js'
import {addContributorsList, addBadge} from './init/init-content.js'

process.stdout.write(
  YoctoColors.yellow(
    `${YoctoColors.bold(
      'WARNING',
    )} :: Using the all-contributors node-api comes with zero guarantees of stability and may contain breaking changes without warning\n`,
  ),
)

export const initContributorsList = addContributorsList
export const initBadge = addBadge

export {addContributorWithDetails, generate}
