const jst = require('js-tokens').default

const tokenize = data => {
  return data.match(jst).filter(chr => !['', ' ', '-', ':', '='].includes(chr))
}

module.exports = {
  tokenize,
}
