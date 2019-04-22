const strSim = require('string-similarity')

const CATEGORIES = require('./categories.json') //Object.keys(ctrbType('github'));

const MATCH_THRESHOLD = 0.4 //40% to allow for shorter/longer versions of categories
const SIM_EXCEPTIONS = {
  //Those are matched wrongly
  adapter: 'plugin',
  android: 'platform',
  angular: 'code',
  'back-end': 'code',
  bootstrap: 'tool',
  breaking: 'code', //or null
  build: 'infra',
  cd: 'infra',
  ci: 'infra',
  cli: 'code', //or tool
  crash: 'bug', //or null
  dep: 'maintenance',
  dependency: 'maintenance',
  'feature request': 'ideas',
  'front-end': 'code',
  graphic: 'design',
  lib: 'tool', //or code
  library: 'tool', //or code
  linux: 'platform',
  logo: 'design',
  icon: 'design',
  ios: 'platform',
  osx: 'platform',
  pull: 'maintenance',
  react: 'code',
  regression: 'bug',
  ui: 'design', //or code
  ux: 'design',
  vue: 'code',
  windows: 'platform',
  workflow: 'infra', //or projectManagement?
}
const NON_CATEGORY_LABELS = [
  'duplicate',
  'good first issue',
  'help wanted',
  'invalid',
  'wontfix',
  'question',
  'wip',
]

const EMOJIS = {
  ':arrow_heading_down:': 'maintenance',
  ':book:': 'doc',
  ':boom:': 'bug', //or null (for breaking change)
  ':bug:': 'bug', //not really needed
  ':bulb:': 'ideas',
  ':construction:': 'maintenance', //or null (for WIP)
  ':detective:': 'null',
  ':heavy_check_mark:': 'null',
  ':rocket:': 'maintenance', //or code
  ':sos:': 'null',
  ':speech_balloon:': 'null',
  ':warning:': 'security',
}

const SE = Object.keys(SIM_EXCEPTIONS)
const EMO = Object.keys(EMOJIS)

module.exports = function findBestCategory(label) {
  const lbl = label.toLowerCase()
  if (NON_CATEGORY_LABELS.includes(lbl)) return null
  if (lbl in SIM_EXCEPTIONS) return SIM_EXCEPTIONS[lbl]
  const match = strSim.findBestMatch(lbl, CATEGORIES)
  if (match.bestMatch.rating >= MATCH_THRESHOLD) return match.bestMatch.target

  const nclMatch = strSim.findBestMatch(lbl, NON_CATEGORY_LABELS)
  if (nclMatch.bestMatch.rating >= MATCH_THRESHOLD) return null

  const seMatch = strSim.findBestMatch(lbl, SE)
  if (seMatch.bestMatch.rating >= MATCH_THRESHOLD)
    return SIM_EXCEPTIONS[seMatch.bestMatch.target]

  const eMatch = strSim.findBestMatch(lbl, EMO)
  if (eMatch.bestMatch.rating >= MATCH_THRESHOLD)
    return EMOJIS[eMatch.bestMatch.target]

  return null
  /* throw new Error(
    `Match threshold of ${MATCH_THRESHOLD} not met for "${label}"`,
  ) */
}
