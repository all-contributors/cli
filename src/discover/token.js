const jst = require('js-tokens').default

const BAD_TOKENS = [
  //Separators
  '',
  ' ',
  '-',
  ':',
  '=',
  //conjunctions
  'and',
  'but',
  'for',
  'nor',
  'or',
  'so',
  'yet',
  //some adverbs
  'almost',
  'enough',
  'just',
  'too',
  'very',
  //other
  'due',
  'be',
]

const tokenize = data => {
  return data.match(jst).filter(chr => !BAD_TOKENS.includes(chr))
}

module.exports = tokenize
