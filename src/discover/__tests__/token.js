import tokenize from '../token'

test('split spaced words', () => {
  expect(tokenize('hello world')).toEqual(['hello', 'world'])
})

test('split barrelled words', () => {
  expect(tokenize('hello-world')).toEqual(['hello', 'world'])
})

test('split namespaced words', () => {
  expect(tokenize('hello:world')).toEqual(['hello', 'world'])
})

test('no uneeded tokens', () => {
  expect(tokenize('')).toEqual([])
  expect(tokenize('-')).toEqual([])
  expect(tokenize(' ')).toEqual([])
  expect(tokenize(':')).toEqual([])
  expect(tokenize('=')).toEqual([])
})

test('no conjunctions', () => {
  expect(tokenize('a or b')).toEqual(['a', 'b'])
  expect(tokenize('a and b')).toEqual(['a', 'b'])
  expect(tokenize('a nor b')).toEqual(['a', 'b'])
})

test('no (ad)verb modifying adverbs', () => {
  expect(tokenize('too good')).toEqual(['good'])
  expect(tokenize('enough code')).toEqual(['code'])
  expect(tokenize('very hard')).toEqual(['hard'])
  expect(tokenize('just done')).toEqual(['done'])
  expect(tokenize('almost ready')).toEqual(['ready'])
})
