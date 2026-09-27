import {test, expect} from 'vitest'
import {generate} from '../index.js'
import contributors from './fixtures/contributors.json'

/**
 * Returns test fixtures including options, sample contributor, and markdown content.
 * The content includes ALL-CONTRIBUTORS-LIST comment tags where the contributor
 * table should be injected.
 *
 * @returns {Object} Test data with options, jfmengels contributor, and sample content
 */
function fixtures() {
  const options = {
    projectOwner: 'kentcdodds',
    projectName: 'all-contributors',
    imageSize: 100,
    contributorsPerLine: 5,
    contributors,
    contributorTemplate: '<%= contributor.name %> is awesome!',
  }

  const jfmengels = {
    login: 'jfmengels',
    name: 'Jeroen Engels',
    html_url: 'https://github.com/jfmengels',
    avatar_url: 'https://avatars.githubusercontent.com/u/3869412?v=3',
    contributions: ['doc'],
  }

  const content = [
    '# project',
    '',
    'Description',
    '',
    '## Contributors',
    'These people contributed to the project:',
    '<!-- ALL-CONTRIBUTORS-LIST:START -->FOO BAR BAZ<!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'Thanks a lot everyone!',
  ].join('\n')

  return {options, jfmengels, content}
}

test('throws when contributors is undefined (caller must await and pass resolved array)', () => {
  const {options, content} = fixtures()
  expect(() => generate(options, undefined, content)).toThrow(
    'contributors must be an array',
  )
})

test('replace the content between the ALL-CONTRIBUTORS-LIST tags by a table of contributors', () => {
  const {kentcdodds, bogas04} = contributors
  const {options, jfmengels, content} = fixtures()
  const contributorList = [kentcdodds, bogas04, jfmengels]
  const result = generate(options, contributorList, content)

  expect(result).toMatchSnapshot()
})

test('replace the content between the ALL-CONTRIBUTORS-LIST tags by a table of contributors with linkToUsage', () => {
  const {kentcdodds, bogas04} = contributors
  const {options, jfmengels, content} = fixtures()
  const contributorList = [kentcdodds, bogas04, jfmengels]
  const result = generate(
    Object.assign(options, {linkToUsage: true}),
    contributorList,
    content,
  )

  expect(result).toMatchSnapshot()
})

test('replace the content between the ALL-CONTRIBUTORS-LIST tags by a table of contributors without linkToUsage', () => {
  const {kentcdodds, bogas04} = contributors
  const {options, jfmengels, content} = fixtures()
  const contributorList = [kentcdodds, bogas04, jfmengels]
  const result = generate(
    Object.assign(options, {linkToUsage: false}),
    contributorList,
    content,
  )

  expect(result).toMatchSnapshot()
})

test('replace the content between the ALL-CONTRIBUTORS-LIST tags by a custom wrapper around the list of contributors contained in the "bodyContent" tag', () => {
  const {kentcdodds, bogas04} = contributors
  const {options, jfmengels, content} = fixtures()
  const contributorList = [kentcdodds, bogas04, jfmengels]
  const result = generate(
    Object.assign(options, {wrapperTemplate: '<p><%= bodyContent %></p>'}),
    contributorList,
    content,
  )

  expect(result).toMatchSnapshot()
})

test('split contributors into multiples lines when there are too many', () => {
  const {kentcdodds} = contributors
  const {options, content} = fixtures()
  const contributorList = [
    kentcdodds,
    kentcdodds,
    kentcdodds,
    kentcdodds,
    kentcdodds,
    kentcdodds,
    kentcdodds,
  ]
  const result = generate(options, contributorList, content)

  expect(result).toMatchSnapshot()
})

test('split contributors into multiples lines when there are too many with linkToUsage', () => {
  const {kentcdodds} = contributors
  const {options, content} = fixtures()
  const contributorList = [
    kentcdodds,
    kentcdodds,
    kentcdodds,
    kentcdodds,
    kentcdodds,
    kentcdodds,
    kentcdodds,
  ]
  const result = generate(
    Object.assign(options, {linkToUsage: true}),
    contributorList,
    content,
  )

  expect(result).toMatchSnapshot()
})

test('sorts the list of contributors if contributorsSortAlphabetically=true', () => {
  const {kentcdodds, bogas04} = contributors
  const {options, jfmengels, content} = fixtures()

  const resultPreSorted = generate(
    options,
    [bogas04, jfmengels, kentcdodds],
    content,
  )

  options.contributorsSortAlphabetically = true
  const resultAutoSorted = generate(
    options,
    [jfmengels, kentcdodds, bogas04],
    content,
  )

  expect(resultPreSorted).toEqual(resultAutoSorted)
})

test('sorts contributors alphabetically case-insensitively (#370)', () => {
  const {options, content} = fixtures()
  options.contributorsSortAlphabetically = true

  const alice = {
    login: 'alice',
    name: 'Alice',
    avatar_url: 'https://example.com/alice.png',
    profile: 'https://example.com/alice',
    contributions: ['code'],
  }
  const bob = {
    login: 'bob',
    name: 'bob',
    avatar_url: 'https://example.com/bob.png',
    profile: 'https://example.com/bob',
    contributions: ['code'],
  }
  const charlie = {
    login: 'charlie',
    name: 'Charlie',
    avatar_url: 'https://example.com/charlie.png',
    profile: 'https://example.com/charlie',
    contributions: ['code'],
  }
  const david = {
    login: 'david',
    name: 'david',
    avatar_url: 'https://example.com/david.png',
    profile: 'https://example.com/david',
    contributions: ['code'],
  }

  const result = generate(options, [david, alice, bob, charlie], content)
  const expected = generate(options, [alice, bob, charlie, david], content)

  expect(result).toEqual(expected)
})

test('falls back to login when contributor name is missing or empty', () => {
  const {options, content} = fixtures()
  options.contributorsSortAlphabetically = true

  const userA = {
    login: 'adam',
    name: '',
    avatar_url: 'https://example.com/adam.png',
    profile: 'https://example.com/adam',
    contributions: ['code'],
  }
  const userB = {
    login: 'bob',
    name: 'Bob',
    avatar_url: 'https://example.com/bob.png',
    profile: 'https://example.com/bob',
    contributions: ['code'],
  }

  const result = generate(options, [userB, userA], content)
  const expected = generate(options, [userA, userB], content)

  expect(result).toEqual(expected)
})

test('sorts contributors using specified sortLocale or locale (#349)', () => {
  const {options, content} = fixtures()
  options.contributorsSortAlphabetically = true
  options.sortLocale = 'cs'

  const userC = {
    login: 'cecilia',
    name: 'Cecilia',
    avatar_url: 'https://example.com/c.png',
    profile: 'https://example.com/c',
    contributions: ['code'],
  }
  const userCaron = {
    login: 'cenek',
    name: 'Čeněk',
    avatar_url: 'https://example.com/cenek.png',
    profile: 'https://example.com/cenek',
    contributions: ['code'],
  }
  const userD = {
    login: 'david',
    name: 'David',
    avatar_url: 'https://example.com/d.png',
    profile: 'https://example.com/d',
    contributions: ['code'],
  }

  const result = generate(options, [userD, userCaron, userC], content)
  const expected = generate(options, [userC, userCaron, userD], content)

  expect(result).toEqual(expected)
})

test('not inject anything if there is no tags to inject content in', () => {
  const {kentcdodds} = contributors
  const {options} = fixtures()
  const contributorList = [kentcdodds]
  const content = ['# project', '', 'Description', '', 'License: MIT'].join(
    '\n',
  )

  const result = generate(options, contributorList, content)
  expect(result).toBe(content)
})

test('not inject anything if start tag is malformed', () => {
  const {kentcdodds} = contributors
  const {options} = fixtures()
  const contributorList = [kentcdodds]
  const content = [
    '# project',
    '',
    'Description',
    '<!-- ALL-CONTRIBUTORS-LIST:SSSSSSSTART -->',
    '<!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'License: MIT',
  ].join('\n')

  const result = generate(options, contributorList, content)
  expect(result).toBe(content)
})

test('not inject anything if end tag is malformed', () => {
  const {kentcdodds} = contributors
  const {options} = fixtures()
  const contributorList = [kentcdodds]
  const content = [
    '# project',
    '',
    'Description',
    '<!-- ALL-CONTRIBUTORS-LIST:START -->',
    '<!-- ALL-CONTRIBUTORS-LIST:EEEEEEEND -->',
    '',
    'License: MIT',
  ].join('\n')

  const result = generate(options, contributorList, content)
  expect(result).toBe(content)
})

test('inject nothing if there are no contributors', () => {
  const {options, content} = fixtures()
  const contributorList = []
  const expected = [
    '# project',
    '',
    'Description',
    '',
    '## Contributors',
    'These people contributed to the project:',
    '<!-- ALL-CONTRIBUTORS-LIST:START -->',
    '<!-- prettier-ignore-start -->',
    '<!-- markdownlint-disable -->',
    '<!-- markdownlint-restore -->',
    '<!-- prettier-ignore-end -->',
    '',
    '<!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'Thanks a lot everyone!',
  ].join('\n')

  const result = generate(options, contributorList, content)

  expect(result).toBe(expected)
})

test('replace all-contributors badge if present', () => {
  const {kentcdodds} = contributors
  const {options} = fixtures()
  const contributorList = [kentcdodds]
  const content = [
    '# project',
    '',
    'Badges',
    [
      '[![version](https://img.shields.io/npm/v/all-contributors-cli.svg?style=flat-square)](http://npm.im/all-contributors-cli)',
      '<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->\n',
      '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)\n',
      '<!-- ALL-CONTRIBUTORS-BADGE:END -->\n',
      '[![version](https://img.shields.io/npm/v/all-contributors-cli.svg?style=flat-square)](http://npm.im/all-contributors-cli)',
    ].join(''),
    '',
    'License: MIT',
  ].join('\n')
  const expected = [
    '# project',
    '',
    'Badges',
    [
      '[![version](https://img.shields.io/npm/v/all-contributors-cli.svg?style=flat-square)](http://npm.im/all-contributors-cli)',
      '<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->\n',
      '[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)\n',
      '<!-- ALL-CONTRIBUTORS-BADGE:END -->\n',
      '[![version](https://img.shields.io/npm/v/all-contributors-cli.svg?style=flat-square)](http://npm.im/all-contributors-cli)',
    ].join(''),
    '',
    'License: MIT',
  ].join('\n')

  const result = generate(options, contributorList, content)

  expect(result).toBe(expected)
})

test('validate if cell width attribute is floored correctly', () => {
  const {kentcdodds} = contributors
  const {options, content} = fixtures()
  const contributorList = [kentcdodds, kentcdodds, kentcdodds]

  options.contributorsPerLine = 7
  const result = generate(options, contributorList, content)

  expect(result).toMatchSnapshot()
})

test('inject the table when the ALL-CONTRIBUTORS-LIST tag starts the file', () => {
  const {kentcdodds, bogas04} = contributors
  const {options} = fixtures()
  const contributorList = [kentcdodds, bogas04]
  const content = [
    '<!-- ALL-CONTRIBUTORS-LIST:START -->FOO BAR BAZ<!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'Thanks a lot everyone!',
  ].join('\n')

  const result = generate(options, contributorList, content)

  expect(result).toContain('<table>')
  expect(result).toContain('<!-- ALL-CONTRIBUTORS-LIST:END -->')
  expect(result).not.toContain('FOO BAR BAZ')
})
