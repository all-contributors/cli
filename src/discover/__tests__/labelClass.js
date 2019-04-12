import findBestCat from '../labelClass'

// test('simple labels', () => {
//   expect(classifyLabel('bug')).toStrictEqual('bug');
//   // expect(classifyLabel('feature')).toStrictEqual('code');
//   expect(classifyLabel('code')).toStrictEqual('code');
//   expect(classifyLabel('test')).toStrictEqual('test');
//   // expect(classifyLabel('testing')).toStrictEqual('test');
// });

test('exact labels', () => {
  expect(findBestCat('bug')).toStrictEqual('bug')
  expect(findBestCat('code')).toStrictEqual('code')
  expect(findBestCat('test')).toStrictEqual('test')
})

test('almost the same', () => {
  expect(findBestCat('testing')).toStrictEqual('test')
  expect(findBestCat('sec')).toStrictEqual('security')
})

test('exceptions', () => {
  expect(findBestCat('build')).toStrictEqual('infra')
  expect(findBestCat('back-end')).toStrictEqual('code')
})

test('nothing found', () => {
  expect(() => findBestCat('doing')).toThrowError(
    'Match threshold of 0.4 not met for "doing"',
  )
})
