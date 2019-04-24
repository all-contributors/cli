const ck = require('chalk')
const findCat = require('./findCategory')

const str = res =>
  `{target: ${ck.green(res.target)}, rating: ${ck.green(
    res.rating,
  )}, ref: ${ck.green(res.ref)}}`

/* eslint-disable no-console */
module.exports = (data, log = true) => {
  const actual = findCat(data.label, true)
  if (actual === null) {
    const equal = `${actual}` === data.category
    if (log) {
      /* eslint-disable babel/no-unused-expressions */
      equal
        ? console.log(
            ck.green('OK'),
            ck.magenta(data.label),
            'in',
            ck.cyan(data.category),
          )
        : console.log(
            ck.red('NO'),
            ck.magenta(data.label),
            ': actual/expected',
            ck.yellow(actual),
            ck.cyan(data.category),
          )
      /* eslint-enable babel/no-unused-expressions */
    }
    return equal
  }
  const equal = actual.target === data.category
  if (log) {
    /* eslint-disable babel/no-unused-expressions */
    equal
      ? console.log(
          ck.green('OK'),
          ck.magenta(data.label),
          'in',
          ck.cyan(data.category),
        )
      : console.log(
          ck.red('NO'),
          ck.magenta(data.label),
          ': actual/expected',
          ck.yellow(actual.target),
          ck.cyan(data.category),
          '\n\tactual (full)=',
          str(actual),
        )
    /* eslint-disable babel/no-unused-expressions */
  }
  return equal
}
/* eslint-enable no-console */
