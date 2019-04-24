const jst = require('js-tokens').default

const BAD_TOKENS = [
  '',
  ' ',
  '-',
  ':',
  '=', //separators
  'for',
  'and',
  'nor',
  'but',
  'or',
  'yet',
  'so', //conjunctions
]

const tokenize = data => {
  return data.match(jst).filter(chr => !BAD_TOKENS.includes(chr))
}

module.exports = {
  tokenize,
}
