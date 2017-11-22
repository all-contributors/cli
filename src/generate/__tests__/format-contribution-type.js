import formatContributionType from '../format-contribution-type'
import contributors from './fixtures/contributors.json'

const fixtures = () => {
  const options = {
    projectOwner: 'jfmengels',
    projectName: 'all-contributors-cli',
    imageSize: 100,
  }
  return {options}
}

test('return corresponding symbol', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()

  expect(formatContributionType(options, contributor, 'tool')).toBe(
    '[🔧](#tool-kentcdodds "Tools")',
  )
  expect(formatContributionType(options, contributor, 'question')).toBe(
    '[💬](#question-kentcdodds "Answering Questions")',
  )
})

test('return link to commits', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  const expectedLink =
    'https://github.com/jfmengels/all-contributors-cli/commits?author=kentcdodds'

  expect(formatContributionType(options, contributor, 'code')).toBe(
    `[💻](${expectedLink} "Code")`,
  )
  expect(formatContributionType(options, contributor, 'doc')).toBe(
    `[📖](${expectedLink} "Documentation")`,
  )
  expect(formatContributionType(options, contributor, 'test')).toBe(
    `[⚠️](${expectedLink} "Tests")`,
  )
})

test('return link to issues', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  const expected =
    '[🐛](https://github.com/jfmengels/all-contributors-cli/issues?q=author%3Akentcdodds "Bug reports")'

  expect(formatContributionType(options, contributor, 'bug')).toBe(expected)
})

test('make any symbol into a link if contribution is an object', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  const contribution = {
    type: 'tool',
    url: 'www.foo.bar',
  }

  expect(formatContributionType(options, contributor, contribution)).toBe(
    '[🔧](www.foo.bar "Tools")',
  )
})

test('override url for given types', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  const contribution = {
    type: 'code',
    url: 'www.foo.bar',
  }

  expect(formatContributionType(options, contributor, contribution)).toBe(
    '[💻](www.foo.bar "Code")',
  )
})

test('be able to add types to the symbol list', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  options.types = {
    cheerful: {symbol: ':smiley:'},
  }

  expect(formatContributionType(options, contributor, 'cheerful')).toBe(
    '[:smiley:](#cheerful-kentcdodds "")',
  )
  expect(
    formatContributionType(options, contributor, {
      type: 'cheerful',
      url: 'www.foo.bar',
    }),
  ).toBe('[:smiley:](www.foo.bar "")')
})

test('be able to add types with template to the symbol list', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  options.types = {
    web: {
      symbol: ':web:',
      link: 'www.<%= contributor.login %>.com',
    },
  }

  expect(formatContributionType(options, contributor, 'web')).toBe(
    '[:web:](www.kentcdodds.com "")',
  )
})

test('be able to override existing types', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  options.types = {
    code: {symbol: ':smiley:'},
  }

  expect(formatContributionType(options, contributor, 'code')).toBe(
    '[:smiley:](#code-kentcdodds "")',
  )
  expect(
    formatContributionType(options, contributor, {
      type: 'code',
      url: 'www.foo.bar',
    }),
  ).toBe('[:smiley:](www.foo.bar "")')
})

test('be able to override existing templates', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  options.types = {
    code: {
      symbol: ':web:',
      link: 'www.<%= contributor.login %>.com',
    },
  }

  expect(formatContributionType(options, contributor, 'code')).toBe(
    '[:web:](www.kentcdodds.com "")',
  )
  expect(
    formatContributionType(options, contributor, {
      type: 'code',
      url: 'www.foo.bar',
    }),
  ).toBe('[:web:](www.foo.bar "")')
})

test('throw a helpful error on unknown type', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  expect(() =>
    formatContributionType(options, contributor, 'docs'),
  ).toThrowError('Unknown contribution type docs for contributor kentcdodds')
})
