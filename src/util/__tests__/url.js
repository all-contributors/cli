import {test, expect} from 'vitest'
import {isHttpProtocol, isValidHttpUrl, parseHttpUrl} from '../url.js'

test(`Result of protocol validation should be true`, () => {
  expect(isHttpProtocol('http:')).toBe(true)
  expect(isHttpProtocol('https:')).toBe(true)
})

test(`Result of protocol validation should be false`, () => {
  expect(isHttpProtocol('ftp:')).toBe(false)
})

test(`Result of url validation should be true`, () => {
  expect(isValidHttpUrl('https://api.github.com/users/octocat')).toBe(true)
})

test(`Result of url validation should be false when url uses wrong protocol`, () => {
  expect(
    isValidHttpUrl(
      'git://git@github.com:all-contributors/all-contributors-cli.git',
    ),
  ).toBe(false)
})

test(`Result of url validation should be false when input isn't url`, () => {
  expect(isValidHttpUrl('github-octocat')).toBe(false)
})

test(`Result of parsed url should be equal`, () => {
  const input = 'https://api.github.com/users/octocat'
  const expected = 'https://api.github.com/users/octocat'
  expect(parseHttpUrl(input)).toBe(expected)
})

test(`Result of parsed url without protocol should be equal`, () => {
  const input = 'example.com'
  const expected = 'http://example.com/'
  expect(parseHttpUrl(input)).toBe(expected)
})

test(`Throw an error when parsed input isn't a string`, () => {
  const input = 123
  expect(parseHttpUrl.bind(null, input)).toThrow('input must be a string')
})

test(`Throw an error when parsed url has wrong protocol`, () => {
  const input = 'ftp://domain.xyz'
  expect(parseHttpUrl.bind(null, input)).toThrow(
    'Provided URL has an invalid protocol',
  )
})

test(`Throw an error when parsed input isn't a URL`, () => {
  const input = 'some string'
  expect(parseHttpUrl.bind(null, input)).toThrow('Invalid URL')
})
