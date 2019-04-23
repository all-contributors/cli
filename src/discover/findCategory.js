const strSim = require('string-similarity')
const {tokenize} = require('./token')
const CATEGORIES = require('./categories.json') //Object.keys(ctrbType('github'));
const SIM_EXCEPTIONS = require('./simExceptions')

const MATCH_THRESHOLD = 0.4 //40% to allow for shorter/longer versions of categories
const COMPLEX_THRESHOLD = 0.7 //70% to make sure really similar composed labels are matchable
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

const COMPOSED_LABELS = {
  'back-end': 'code',
  'code-clean': 'maintenance',
  'front-end': 'code',
  'internal-issue': 'bug',
  'internal-cleanup': 'maintenance'
}

const SE = Object.keys(SIM_EXCEPTIONS)
const CL = Object.keys(COMPOSED_LABELS)

function bestCat(label, showRating) {
  const lbl = label.toLowerCase()
  if (NON_CATEGORY_LABELS.includes(lbl)) return null
  if (lbl in SIM_EXCEPTIONS) {
    const target = SIM_EXCEPTIONS[lbl]
    return showRating ? {target, rating: 1} : target
  }
  const match = strSim.findBestMatch(lbl, CATEGORIES).bestMatch
  const seMatch = { ...strSim.findBestMatch(lbl, SE).bestMatch, ref: 'SE' }
  const clMatch = { ...strSim.findBestMatch(lbl, CL).bestMatch, ref: 'CL' }

  const scores = [match, seMatch, clMatch].sort((a, b) => b.rating - a.rating)
  if (process.env.DEBUG) console.log('scores=', scores)
  let idx = 0
  while (scores[idx++].rating < MATCH_THRESHOLD && idx < scores.length) {
    /*  */
  }
  if (process.env.DEBUG) console.log('idx-1=', idx - 1, 'score=', scores[idx - 1], 'len=', scores.length)
  switch (idx) {
    case scores.length:
      return null
    default:
      --idx
      // console.log('after --idx:', idx, 'score=', scores[idx])
      let target = scores[idx].target
      // console.log('target=', target)
      if (scores[idx].ref === 'SE') target = SIM_EXCEPTIONS[scores[idx].target]
      else if (scores[idx].ref === 'CL') target = COMPOSED_LABELS[scores[idx].target]
      
      if (showRating) {
        return {
          ...scores[idx],
          target
        }
      }
      return target
  }
}

function findBestCategory(label, showRating) {
  const lbl = label.toLowerCase();
  if (NON_CATEGORY_LABELS.includes(lbl)) return null
  if (CL.includes(lbl)) return bestCat(lbl, showRating)
  const tokens = tokenize(lbl)
  const composition = tokens.join('-')
  if (CL.includes(composition)) return bestCat(composition, showRating)
  else {
    const composedMatch = strSim.findBestMatch(lbl, CL).bestMatch
    const target = COMPOSED_LABELS[composedMatch.target]
    if (composedMatch.rating >= COMPLEX_THRESHOLD) {
      return showRating ? { ...composedMatch, target, ref: 'CPX' } : target
    }
  }
  if (process.env.DEBUG) console.log('tokens=', tokens)
  if (tokens.length > 1) {
    //If `lbl` can be split into *several* tokens
    const cats = tokens
      .map(tk => bestCat(tk, true))
      .filter(cat => cat !== null)
    if (!cats.length) return null
    cats.sort((a, b) => b.rating - a.rating)
    return showRating ? cats[0] : cats[0].target
  } else if (tokens.length === 1) return bestCat(tokens[0], showRating)

  process.stdout.write(`Match threshold of ${MATCH_THRESHOLD} not met for "${label}"\n`)
  return null
}

module.exports = findBestCategory
