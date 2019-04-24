const ck = require('chalk')
const valid = require('./valid')
const labels = require('./labels')

if (labels.getBadData().length) throw new Error('Bad data!')

const portion = labels.size() ** -1 * 100

const nulLabels = labels.getNullCatLabels()
const allLabels = labels.getAll()
/* eslint-disable no-console */
console.log(ck.blueBright('\tNull labels'), '*', nulLabels.length)
const nulScore = {
  yes: 0,
  no: 0,
}
const score = {
  yes: 0,
  no: 0,
}

nulLabels.forEach(data => {
  return valid(data, process.env.LOGN) ? nulScore.yes++ : nulScore.no++
})

const perc = s => Math.round(s.yes * portion * 1000) / 1000

nulScore.total = nulScore.yes - nulScore.no
console.log(`Null scores= ${ck.yellow(nulScore.total)} (${perc(nulScore)}%)
yes = ${ck.green(nulScore.yes)}\tno = ${ck.red(nulScore.no)}`)

allLabels.forEach(data => {
  return valid(data, process.env.LOG || false) ? score.yes++ : score.no++
})

score.total = score.yes - score.no
console.log(`\nAll scores= ${ck.yellow(score.total)} (${perc(score)}%)
yes = ${ck.green(score.yes)}\tno = ${ck.red(score.no)}`)
/* eslint-enable no-console */
