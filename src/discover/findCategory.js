const strSim = require('string-similarity')

const CATEGORIES = require('./categories.json') //Object.keys(ctrbType('github'));

const MATCH_THRESHOLD = 0.4 //40% to allow for shorter/longer versions of categories
const SIM_EXCEPTIONS = {
  //Those are matched wrongly
  adapter: 'plugin',
  'back-end': 'code',
  build: 'infra',
  cd: 'infra',
  ci: 'infra',
  cli: 'code', //or tool
  dep: 'maintenance',
  dependency: 'maintenance',
  'front-end': 'code',
  graphic: 'design',
  lib: 'tool', //or code
  library: 'tool', //or code
  ui: 'design', //or code
  ux: 'design',
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

module.exports = function findBestCategory(label) {
  const lbl = label.toLowerCase()
  if (NON_CATEGORY_LABELS.includes(lbl)) return null
  if (lbl in SIM_EXCEPTIONS) return SIM_EXCEPTIONS[lbl]
  const match = strSim.findBestMatch(lbl, CATEGORIES)
  if (match.bestMatch.rating >= MATCH_THRESHOLD) return match.bestMatch.target

  const nclMatch = strSim.findBestMatch(lbl, NON_CATEGORY_LABELS)
  if (nclMatch.bestMatch.rating >= MATCH_THRESHOLD) return null

  const seMatch = strSim.findBestMatch(lbl, Object.keys(SIM_EXCEPTIONS))
  if (seMatch.bestMatch.rating >= MATCH_THRESHOLD)
    return SIM_EXCEPTIONS[match.bestMatch.target]

  throw new Error(
    `Match threshold of ${MATCH_THRESHOLD} not met for "${label}"`,
  )
}
