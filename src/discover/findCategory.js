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
  babel: 'tool',
  'back-end': 'code',
  bootstrap: 'tool',
  breaking: 'code', //or null
  build: 'infra',
  cd: 'infra',
  cdn: 'platform',
  ci: 'infra',
  cleanup: 'maintenance',
  cli: 'code', //or tool
  chat: 'ideas',
  configuration: 'code',
  core: 'maintenance',
  chore: 'maintenance',
  crash: 'bug', //or null
  csharp: 'code',
  css: 'code',
  currency: 'financial',
  defect: 'bug',
  dep: 'maintenance',
  dependency: 'maintenance',
  device: 'platform',
  discuss: 'ideas',
  document: 'doc',
  dom: 'code',
  e2e: 'test',
  es6: 'code',
  external: 'plugin',
  frontend: 'code',
  future: 'ideas',
  graphic: 'design',
  greenkeeper: 'infra',
  hack: 'code',
  html: 'code',
  legal: 'security',
  lib: 'tool', //or code
  library: 'tool', //or code
  lint: 'maintenance',
  linux: 'platform',
  logo: 'design',
  icon: 'design',
  insight: 'ideas',
  install: 'tool',
  internal: 'code',
  'internal-issue': 'bug',
  // issue: 'bug',
  ios: 'platform',
  javascript: 'code',
  js: 'code',
  mac: 'platform',
  meet: 'eventOrganizing',
  module: 'code',
  new: 'ideas',
  node: 'platform',
  opinion: 'ideas',
  optim: 'code',
  osx: 'platform',
  package: 'platform',
  parser: 'tool',
  php: 'code',
  pull: 'maintenance',
  react: 'code',
  regression: 'bug',
  rendering: 'code',
  request: 'ideas',
  rfc: 'ideas',
  ruby: 'code',
  shell: 'tool',
  spec: 'doc',
  todo: 'maintenance',
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
  if (NON_CATEGORY_LABELS.includes(lbl)) return null
  if (lbl in SIM_EXCEPTIONS) {
    const target = SIM_EXCEPTIONS[lbl]
    return showRating ? {target, rating: 1} : target
  }
  const match = strSim.findBestMatch(lbl, CATEGORIES)
  const seMatch = strSim.findBestMatch(lbl, SE)
  const goodMatch = match.bestMatch.rating >= MATCH_THRESHOLD
  const goodSeMatch = seMatch.bestMatch.rating >= MATCH_THRESHOLD

  if (goodMatch && match.bestMatch.rating >= seMatch.bestMatch.rating) {
    return showRating ? match.bestMatch : match.bestMatch.target
  }

  const nclMatch = strSim.findBestMatch(lbl, NON_CATEGORY_LABELS)
  if (nclMatch.bestMatch.rating >= MATCH_THRESHOLD) return null

  if (goodSeMatch) {
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
