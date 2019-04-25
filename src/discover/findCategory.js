const strSim = require('string-similarity')
const tokenize = require('./token')
const CATEGORIES = require('./categories.json') //Object.keys(ctrbType('github'));
const SIM_EXCEPTIONS = require('./simExceptions')

const MATCH_THRESHOLD = 0.4 //40% to allow for shorter/longer versions of categories
// const COMPLEX_THRESHOLD = 0.7 //70% to make sure really similar composed labels are matchable
const NON_CATEGORY_LABELS = [
  'area',
  'available',
  'awaiting',
  'backlog', //or could be a projectManagement one
  'beginner-friendly',
  'block',
  'bounty',
  'cla',
  'closed',
  'component',
  'concurrent',
  'confirm',
  'conflict',
  'contribution welcome',
  'difficulty',
  'done',
  'duplicate',
  'enterprise',
  'gender',
  'feedback',
  'good first issue',
  'help',
  'help wanted',
  'hold',
  'in progress',
  'inactive',
  'info',
  'invalid',
  'merge',
  'n/a',
  'needs',
  'priority',
  'question',
  'reminder',
  'repo',
  'reproduce',
  'requested',
  'resolution',
  'signed',
  'spam',
  'stale',
  'start',
  'unknown',
  'wip',
  'wontfix',
  'working',
  'wrong',
]

const COMPOSED_LABELS = {
  'awaiting-review': 'null',
  'back-end': 'code',
  'cla-no': 'null',
  'cla-sign': 'null',
  'cla-yes': 'null',
  'code-clean': 'maintenance',
  'current-mod': 'null',
  'difficulty-easy': 'null',
  'first-time': 'null',
  'front-end': 'code',
  'internal-issue-created': 'bug',
  'internal-cleanup': 'maintenance',
  'needs-a': 'null',
  'needs-more': 'null',
  'non-library': 'null',
  'not-a-bug': 'null',
  'other-feature': 'ideas',
  'review-in-progress': 'null',
  'review-request': 'null',
  'work-in-progress': 'null',
}

const SE = Object.keys(SIM_EXCEPTIONS)
const CL = Object.keys(COMPOSED_LABELS)

function bestCat(label, showRating = false, log = false) {
  const lbl = label.toLowerCase()
  if (NON_CATEGORY_LABELS.includes(lbl)) return null
  if (lbl in SIM_EXCEPTIONS) {
    const target = SIM_EXCEPTIONS[lbl]
    return showRating ? {target, rating: 1} : target
  }
  const match = {...strSim.findBestMatch(lbl, CATEGORIES).bestMatch, ref: ''}
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
  if (NON_CATEGORY_LABELS.includes(lbl)) return null
  if (CL.includes(lbl)) return bestCat(lbl, showRating, log)
  const tokens = tokenize(lbl)
  const composition = tokens.join('-')
  if (CL.includes(composition)) return bestCat(composition, showRating, log)

  // const composedMatch = strSim.findBestMatch(lbl, CL).bestMatch
  // const target = COMPOSED_LABELS[composedMatch.target]
  // if (composedMatch.rating >= COMPLEX_THRESHOLD) {
  //   return showRating ? {...composedMatch, target, ref: 'CPX'} : target
  // }

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
