import formatContributionType from '../format-contribution-type'
import contributors from './fixtures/contributors.json'

const fixtures = () => {
  const options = {
    projectOwner: 'all-contributors',
    projectName: 'all-contributors-cli',
    repoType: 'github',
    repoHost: 'https://github.com',
    imageSize: 100,
  }
  return {options}
}

test('return corresponding symbol', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()

  expect(formatContributionType(options, contributor, 'tool')).toBe(
    '<a href="#tool-kentcdodds" title="Tools">🔧</a>',
  )
  expect(formatContributionType(options, contributor, 'question')).toBe(
    '<a href="#question-kentcdodds" title="Answering Questions">💬</a>',
  )
})

test('return link to commits', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  const expectedLink =
    'https://github.com/all-contributors/all-contributors-cli/commits?author=kentcdodds'

  expect(formatContributionType(options, contributor, 'code')).toBe(
    `<a href="${expectedLink}" title="Code">💻</a>`,
  )
  expect(formatContributionType(options, contributor, 'doc')).toBe(
    `<a href="${expectedLink}" title="Documentation">📖</a>`,
  )
  expect(formatContributionType(options, contributor, 'test')).toBe(
    `<a href="${expectedLink}" title="Tests">⚠️</a>`,
  )
})

test('return link to issues', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  const expected =
    '<a href="https://github.com/all-contributors/all-contributors-cli/issues?q=author%3Akentcdodds" title="Bug reports">🐛</a>'

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
    '<a href="www.foo.bar" title="Tools">🔧</a>',
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
    '<a href="www.foo.bar" title="Code">💻</a>',
  )
})

test('be able to add types to the symbol list', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  options.types = {
    cheerful: {symbol: ':smiley:'},
  }

  expect(formatContributionType(options, contributor, 'cheerful')).toBe(
    '<a href="#cheerful-kentcdodds" title="">:smiley:</a>',
  )
  expect(
    formatContributionType(options, contributor, {
      type: 'cheerful',
      url: 'www.foo.bar',
    }),
  ).toBe('<a href="www.foo.bar" title="">:smiley:</a>')
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
    '<a href="www.kentcdodds.com" title="">:web:</a>',
  )
})

test('be able to override existing types', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  options.types = {
    code: {symbol: ':smiley:'},
  }

  expect(formatContributionType(options, contributor, 'code')).toBe(
    '<a href="#code-kentcdodds" title="">:smiley:</a>',
  )
  expect(
    formatContributionType(options, contributor, {
      type: 'code',
      url: 'www.foo.bar',
    }),
  ).toBe('<a href="www.foo.bar" title="">:smiley:</a>')
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
    '<a href="www.kentcdodds.com" title="">:web:</a>',
  )
  expect(
    formatContributionType(options, contributor, {
      type: 'code',
      url: 'www.foo.bar',
    }),
  ).toBe('<a href="www.foo.bar" title="">:web:</a>')
})

test('throw a helpful error on unknown type', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  expect(() =>
    formatContributionType(options, contributor, 'docs'),
  ).toThrowError('Unknown contribution type docs for contributor kentcdodds')
})

test('throw a helpful error on unknown type and no login', () => {
  const contributor = contributors.nologin_badrole
  const {options} = fixtures()
  expect(() =>
    formatContributionType(options, contributor, 'docs'),
  ).toThrowError(
    'Unknown contribution type docs for contributor Wildly Misconfigured',
  )
})
