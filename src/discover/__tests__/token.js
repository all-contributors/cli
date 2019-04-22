import {tokenize} from '../token'

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
