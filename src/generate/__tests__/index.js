import {test, expect} from 'vitest'
import generate from '../index.js'
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

/**
 * Tests that generate throws an error when contributors is undefined.
 * This prevents callers from forgetting to await the contributors promise
 * before passing it to generate.
 */
test('throws when contributors is undefined (caller must await and pass resolved array)', () => {
  const {options, content} = fixtures()
  expect(() => generate(options, undefined, content)).toThrow(
    /Cannot read properties of undefined \(reading 'length'\)/,
  )
})

/**
 * Tests that generate replaces content between ALL-CONTRIBUTORS-LIST tags
 * with a properly formatted table of contributors.
 */
test('replace the content between the ALL-CONTRIBUTORS-LIST tags by a table of contributors', () => {
  const {kentcdodds, bogas04} = contributors
  const {options, jfmengels, content} = fixtures()
  const contributorList = [kentcdodds, bogas04, jfmengels]
  const result = generate(options, contributorList, content)

  expect(result).toMatchSnapshot()
})

/**
 * Tests that generate includes a link to usage documentation when
 * linkToUsage option is set to true.
 */
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

/**
 * Tests that generate does not include a usage link when linkToUsage
 * option is explicitly set to false.
 */
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

/**
 * Tests that generate uses a custom wrapper template when provided.
 * The wrapper template can contain <%= bodyContent %> to position the
 * contributor list within custom HTML/markdown.
 */
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

/**
 * Tests that generate splits contributors into multiple table rows when
 * the number of contributors exceeds the contributorsPerLine setting.
 */
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

/**
 * Tests that generate splits contributors into multiple rows with linkToUsage
 * enabled when there are more contributors than fit on one line.
 */
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

/**
 * Tests that generate sorts contributors alphabetically when
 * contributorsSortAlphabetically option is true. The output should
 * match regardless of the input order.
 */
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

/**
 * Tests that generate returns the content unchanged when there are no
 * ALL-CONTRIBUTORS-LIST tags present in the content.
 */
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

/**
 * Tests that generate returns the content unchanged when the start tag
 * is malformed (e.g., ALL-CONTRIBUTORS-LIST:SSSSSSSTART instead of :START).
 */
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

/**
 * Tests that generate returns the content unchanged when the end tag
 * is malformed (e.g., ALL-CONTRIBUTORS-LIST:EEEEEEEND instead of :END).
 */
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

/**
 * Tests that generate injects only the comment structure (with prettier
 * and markdownlint directives) when the contributors list is empty.
 */
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

/**
 * Tests that generate updates the all-contributors badge count when
 * ALL-CONTRIBUTORS-BADGE tags are present in the content. The badge
 * count should match the number of contributors.
 */
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

/**
 * Tests that generate correctly calculates cell width when contributorsPerLine
 * results in a decimal value. The width should be floored to an integer to
 * ensure valid HTML table attributes.
 */
test('validate if cell width attribute is floored correctly', () => {
  const {kentcdodds} = contributors
  const {options, content} = fixtures()
  const contributorList = [kentcdodds, kentcdodds, kentcdodds]

  options.contributorsPerLine = 7
  const result = generate(options, contributorList, content)

  expect(result).toMatchSnapshot()
})
