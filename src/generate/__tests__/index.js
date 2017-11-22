import generate from '../'
import contributors from './fixtures/contributors.json'

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

test('replace the content between the ALL-CONTRIBUTORS-LIST tags by a table of contributors', () => {
  const {kentcdodds, bogas04} = contributors
  const {options, jfmengels, content} = fixtures()
  const contributorList = [kentcdodds, bogas04, jfmengels]
  const result = generate(options, contributorList, content)

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
    '<!-- prettier-ignore -->',
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
      '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors)',
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
      '[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)',
      '[![version](https://img.shields.io/npm/v/all-contributors-cli.svg?style=flat-square)](http://npm.im/all-contributors-cli)',
    ].join(''),
    '',
    'License: MIT',
  ].join('\n')

  const result = generate(options, contributorList, content)

  expect(result).toBe(expected)
})
