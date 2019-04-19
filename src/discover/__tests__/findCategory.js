import findBestCategory from '../labelClass'

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
  expect(() => findBestCategory('doing')).toThrowError(
    'Match threshold of 0.4 not met for "doing"',
  )
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
})
