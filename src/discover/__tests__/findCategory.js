import chalk from 'chalk'
import findBestCategory from '../findCategory'
import {getAt, size} from '../labels'

test('exact labels', () => {
  expect(findBestCategory('bug')).toStrictEqual('bug')
  expect(findBestCategory('code')).toStrictEqual('code')
  expect(findBestCategory('test')).toStrictEqual('test')
})

test('GH labels', () => {
  expect(findBestCategory('duplicate')).toStrictEqual(null)
  expect(findBestCategory('enhancement')).toStrictEqual('maintenance') //or code?
  expect(findBestCategory('good first issue')).toStrictEqual(null)
  expect(findBestCategory('help wanted')).toStrictEqual(null) //maintenance?
  expect(findBestCategory('invalid')).toStrictEqual(null)
  expect(findBestCategory('wontfix')).toStrictEqual(null)
})

test('almost the same', () => {
  expect(findBestCategory('testing')).toStrictEqual('test')
  expect(findBestCategory('sec')).toStrictEqual('security')
})

test('exceptions', () => {
  expect(findBestCategory('build')).toStrictEqual('infra')
  expect(findBestCategory('back-end')).toStrictEqual('code')
})

test('nothing found', () => {
  /* expect(() => findBestCategory('doing')).toThrowError(
    'Match threshold of 0.4 not met for "doing"',
  ) */
  expect(findBestCategory('archive')).toStrictEqual(null)
})

test('namespaced labels', () => {
  expect(findBestCategory('type: bug')).toStrictEqual('bug')
  expect(findBestCategory('Type: Bug')).toStrictEqual('bug')
  expect(findBestCategory('type-bug')).toStrictEqual('bug')
  expect(findBestCategory('cat:bug')).toStrictEqual('bug')
  expect(findBestCategory('cat-bug')).toStrictEqual('bug')
  expect(findBestCategory('Bug 🐛')).toStrictEqual('bug')
})

test('accurate guessing', () => {
  /* @todo Test findBestCategory() on each items of labels.json */
  for (let i = 0; i < size(); ++i) {
    const data = getAt(i)
    let expectedCat = ''
    /* @todo remove this line soon */
    /* eslint-disable no-continue */
    if (data.category === 'null') continue //skip the unclassifiable ones (for now)
    /* eslint-enable no-continue */
    process.stdout.write(`\n${chalk.cyan(`label guess: ${data.label}`)}\n`)
    try {
      expectedCat = findBestCategory(data.label)
    } catch (err) {
      process.stdout.write(
        `${chalk.yellow(`Oooh boi! err= ${err.message}`)}\n\n`,
      )
      expectedCat = 'null'
    }
    expect(expectedCat).toStrictEqual(data.category)
  }
})
