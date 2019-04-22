const strSim = require('string-similarity')
const {tokenize} = require('./token')
const CATEGORIES = require('./categories.json') //Object.keys(ctrbType('github'));

const MATCH_THRESHOLD = 0.4 //40% to allow for shorter/longer versions of categories
const SIM_EXCEPTIONS = {
  //Those are matched wrongly
  adapter: 'plugin',
  android: 'platform',
  angular: 'code',
  api: 'code',
  'back-end': 'code',
  bootstrap: 'tool',
  breaking: 'code', //or null
  build: 'infra',
  cd: 'infra',
  cdn: 'platform',
  ci: 'infra',
  cli: 'code', //or tool
  chat: 'ideas',
  core: 'maintenance',
  chore: 'maintenance',
  crash: 'bug', //or null
  css: 'code',
  dep: 'maintenance',
  dependency: 'maintenance',
  device: 'platform',
  discuss: 'ideas',
  document: 'doc',
  dom: 'code',
  external: 'plugin',
  frontend: 'code',
  future: 'ideas',
  graphic: 'design',
  html: 'code',
  lib: 'tool', //or code
  library: 'tool', //or code
  linux: 'platform',
  logo: 'design',
  icon: 'design',
  internal: 'code',
  // issue: 'bug',
  ios: 'platform',
  javascript: 'code',
  js: 'code',
  mac: 'platform',
  meet: 'eventOrganizing',
  new: 'ideas',
  optim: 'code',
  osx: 'platform',
  php: 'code',
  pull: 'maintenance',
  react: 'code',
  regression: 'bug',
  request: 'ideas',
  rfc: 'ideas',
  ui: 'design', //or code
  ux: 'design',
  vue: 'code',
  vuln: 'security',
  windows: 'platform',
  workflow: 'infra', //or projectManagement?
}
const NON_CATEGORY_LABELS = [
  'component',
  'duplicate',
  'good first issue',
  'help wanted',
  'invalid',
  'question',
  'wip',
  'wontfix',
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
  ':rocket:': 'maintenance', //or code or ideas
  ':sos:': 'null',
  ':speech_balloon:': 'null',
  ':warning:': 'security',
}

const SE = Object.keys(SIM_EXCEPTIONS)
const EMO = Object.keys(EMOJIS)

function bestCat(label, showRating) {
  const lbl = label.toLowerCase()
  if (lbl in SIM_EXCEPTIONS) {
    const target = SIM_EXCEPTIONS[lbl]
    return showRating ? {target, rating: 1} : target
  }
  const match = strSim.findBestMatch(lbl, CATEGORIES)
  if (match.bestMatch.rating >= MATCH_THRESHOLD) {
    return showRating ? match.bestMatch : match.bestMatch.target
  }

  const nclMatch = strSim.findBestMatch(lbl, NON_CATEGORY_LABELS)
  if (nclMatch.bestMatch.rating >= MATCH_THRESHOLD) return null

  const seMatch = strSim.findBestMatch(lbl, SE)
  if (seMatch.bestMatch.rating >= MATCH_THRESHOLD) {
    const target = SIM_EXCEPTIONS[seMatch.bestMatch.target]
    return showRating
      ? {
          seTarget: seMatch.bestMatch.target,
          rating: seMatch.bestMatch.rating,
          target,
        }
      : target
  }
  const eMatch = strSim.findBestMatch(lbl, EMO)
  if (eMatch.bestMatch.rating >= MATCH_THRESHOLD) {
    const target = EMOJIS[eMatch.bestMatch.target]
    return showRating
      ? {
          eTarget: eMatch.bestMatch.target,
          rating: eMatch.bestMatch.rating,
          target,
        }
      : target
  }

  return null
}

function findBestCategory(label, showRating) {
  if (NON_CATEGORY_LABELS.includes(label.toLowerCase())) return null
  const tokens = tokenize(label)
  if (tokens.length > 1) {
    //If `lbl` can be split into * several* tokens
    const cats = tokens
      .map(tk => bestCat(tk, true))
      .filter(cat => cat !== null)
      .sort((a, b) => b.rating - a.rating)
    if (!cats.length) return null
    return showRating ? cats[0] : cats[0].target
  } else if (tokens.length === 1) return bestCat(tokens[0], showRating)

  return null
  /* throw new Error(
    `Match threshold of ${MATCH_THRESHOLD} not met for "${label}"`,
  ) */
}

module.exports = findBestCategory
