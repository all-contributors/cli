const strSim = require('string-similarity')

const CATEGORIES = [
  'blog',
  'bug',
  'business',
  'code',
  'content',
  'design',
  'doc',
  'eventOrganizing',
  'example',
  'financial',
  'fundingFinding',
  'ideas',
  'infra',
  'maintenance',
  'platform',
  'plugin',
  'projectManagement',
  'question',
  'review',
  'security',
  'talk',
  'test',
  'tool',
  'translation',
  'tutorial',
  'userTesting',
  'video',
] //Object.keys(ctrbType('github'));

const MATCH_THRESHOLD = 0.4 //40% to allow for shorter/longer versions of categories
const SIM_EXCEPTIONS = {
  //Those are matched wrongly
  graphic: 'design',
  'front-end': 'code',
  'back-end': 'code',
  ux: 'design',
  ui: 'design', //or code
  ci: 'infra',
  cd: 'infra',
  build: 'infra',
}
const NON_CATEGORY_LABELS = [
  'duplicate',
  'good first issue',
  'help wanted',
  'invalid',
  'wontfix',
]

module.exports = function findBestCategory(label) {
  const lbl = label.toLowerCase()
  if (NON_CATEGORY_LABELS.includes(lbl)) return null
  if (lbl in SIM_EXCEPTIONS) return SIM_EXCEPTIONS[lbl]
  const match = strSim.findBestMatch(lbl, CATEGORIES)
  if (match.bestMatch.rating >= MATCH_THRESHOLD) return match.bestMatch.target
  throw new Error(
    `Match threshold of ${MATCH_THRESHOLD} not met for "${label}"`,
  )
}
