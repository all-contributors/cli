const strSim = require('string-similarity')
const tokenize = require('./token')
const CATEGORIES = require('./categories.json') //Object.keys(ctrbType('github'));
const SIM_EXCEPTIONS = require('./sets/simExceptions')
const NON_CATEGORY_LABELS = require('./sets/noCategory')

const MATCH_THRESHOLD = 0.4 //40% to allow for shorter/longer versions of categories
// const COMPLEX_THRESHOLD = 0.7 //70% to make sure really similar composed labels are matchable

const COMPOSED_LABELS = {
  'awaiting-review': 'null',
  'back-end': 'code',
  'code-clean': 'maintenance',
  'code-review-request': 'null',
  'current-mod': 'null',
  'difficulty-easy': 'null',
  'do-not-merge': 'null',
  'first-time': 'null',
  'front-end': 'code',
  'in-review': 'null',
  'internal-issue-created': 'bug',
  'internal-cleanup': 'maintenance',
  'non-library': 'null',
  'non-library-issue': 'bug',
  'other-feature': 'ideas',
  'ready-review': 'null',
  'review-changes': 'null',
  'review-needed-passport_control': 'null',
  'review-request': 'null',
  'to-do': 'maintenance',
}

const FORBIDDEN_PREFIXES = [
  'has',
  'in progress',
  'in review',
  'need',
  'not',
  'on hold',
  'pending',
  'planned',
  'review-needed',
]
const FORBIDDEN_SUFFIXES = [
  'accepted',
  'approved',
  'hold',
  'progress',
  'missing',
  'needed',
  'rejected',
  'required',
]

const NAMESPACE_RE = /^(\w+):\s*(.*?)/

const badStartEnd = label => {
  const lbl = label.replace(NAMESPACE_RE, '$2') //Removes the namespace
  for (const prefix of FORBIDDEN_PREFIXES) {
    if (label.startsWith(prefix) || lbl.startsWith(prefix)) return true
  }
  for (const suffix of FORBIDDEN_SUFFIXES) {
    if (label.endsWith(suffix) || lbl.endsWith(suffix)) return true
  }
  return false
}

const SE = Object.keys(SIM_EXCEPTIONS)
const CL = Object.keys(COMPOSED_LABELS)

function bestCat(label, showRating = false, log = false) {
  const lbl = label.toLowerCase()
  if (lbl in SIM_EXCEPTIONS) {
    const target = SIM_EXCEPTIONS[lbl]
    return showRating ? {target, rating: 1} : target
  }
  const match = {...strSim.findBestMatch(lbl, CATEGORIES).bestMatch, ref: 'M'}
  const seMatch = {...strSim.findBestMatch(lbl, SE).bestMatch, ref: 'SE'}
  const nclMatch = {
    ...strSim.findBestMatch(lbl, NON_CATEGORY_LABELS).bestMatch,
    ref: 'NC',
  }
  const clMatch = {...strSim.findBestMatch(lbl, CL).bestMatch, ref: 'CL'}

  const scores = [match, seMatch, clMatch, nclMatch].sort(
    (a, b) => b.rating - a.rating,
  )
  if (log) {
    //eslint-disable-next-line no-console
    console.log('scores=', scores)
  }
  let idx = 0
  while (scores[idx++].rating < MATCH_THRESHOLD && idx < scores.length) {
    /*  */
  }

  if (idx === scores.length) return null
  --idx
  let target = scores[idx].target
  if (scores[idx].ref === 'SE') target = SIM_EXCEPTIONS[scores[idx].target]
  else if (scores[idx].ref === 'CL')
    target = COMPOSED_LABELS[scores[idx].target]
  if (scores[idx].ref === 'NC' || target === 'null') return null //target = null

  if (showRating) {
    return {
      ...scores[idx],
      target,
    }
  }
  return target
}

function findBestCategory(label, showRating = false, log = false) {
  const lbl = label.toLowerCase()
  const lblSubset = lbl.replace(NAMESPACE_RE, '$2') //Removes the namespace
  if (badStartEnd(lbl) || NON_CATEGORY_LABELS.includes(lbl)) return null
  if (CL.includes(lbl)) return bestCat(lbl, showRating, log)
  if (CL.includes(lblSubset)) return bestCat(lblSubset, showRating, log)
  // if (bestCat(lbl.replace(NAMESPACE_RE, '$2')) === null) return null
  const tokens = tokenize(lbl)
  const composition = tokens.join('-')
  const tokenSubset = tokenize(lblSubset)
  const compositionSubset = tokenSubset.join('-')
  if (CL.includes(composition)) return bestCat(composition, showRating, log)
  if (CL.includes(compositionSubset))
    return bestCat(compositionSubset, showRating, log)

  if (tokens.length > 1) {
    //If `lbl` can be split into *several* tokens
    const cats = tokens
      .map(tk => bestCat(tk, true, log))
      .filter(cat => cat !== null)
    if (!cats.length) return null
    cats.sort((a, b) => b.rating - a.rating)
    return showRating ? cats[0] : cats[0].target
  } else if (tokens.length === 1) return bestCat(tokens[0], showRating, log)

  process.stdout.write(
    `Match threshold of ${MATCH_THRESHOLD} not met for "${label}"\n`,
  )
  return null
}

module.exports = findBestCategory
