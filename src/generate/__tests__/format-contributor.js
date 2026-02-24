import {test, expect} from 'vitest'
import {formatContributor} from '../format-contributor.js'
import contributors from './fixtures/contributors.json'

function fixtures() {
  const options = {
    projectOwner: 'all-contributors',
    projectName: 'all-contributors-cli',
    repoType: 'github',
    repoHost: 'https://github.com',
    imageSize: 150,
  }
  return {options}
}

test('format a simple contributor', () => {
  const contributor = {
    ...contributors.kentcdodds,
    contributions: ['review'],
  }
  const {options} = fixtures()

  const expected =
    '<a href="http://kentcdodds.com"><img src="https://avatars1.githubusercontent.com/u/1500684?s=150" width="150px;" alt="Kent C. Dodds"/><br /><sub><b>Kent C. Dodds</b></sub></a><br /><a href="https://github.com/all-contributors/all-contributors-cli/pulls?q=is%3Apr+reviewed-by%3Akentcdodds" title="Reviewed Pull Requests">👀</a>'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('format contributor with complex contribution types', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()

  const expected =
    '<a href="http://kentcdodds.com"><img src="https://avatars1.githubusercontent.com/u/1500684?s=150" width="150px;" alt="Kent C. Dodds"/><br /><sub><b>Kent C. Dodds</b></sub></a><br /><a href="https://github.com/all-contributors/all-contributors-cli/commits?author=kentcdodds" title="Documentation">📖</a> <a href="https://github.com/all-contributors/all-contributors-cli/pulls?q=is%3Apr+reviewed-by%3Akentcdodds" title="Reviewed Pull Requests">👀</a> <a href="#question-kentcdodds" title="Answering Questions">💬</a>'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('format contributor using custom template', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()
  options.contributorTemplate = '<%= contributor.name %> is awesome!'

  const expected = 'Kent C. Dodds is awesome!'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('default image size to 100', () => {
  const contributor = {
    ...contributors.kentcdodds,
    contributions: ['review'],
  }
  const {options} = fixtures()
  delete options.imageSize

  const expected =
    '<a href="http://kentcdodds.com"><img src="https://avatars1.githubusercontent.com/u/1500684?s=100" width="100px;" alt="Kent C. Dodds"/><br /><sub><b>Kent C. Dodds</b></sub></a><br /><a href="https://github.com/all-contributors/all-contributors-cli/pulls?q=is%3Apr+reviewed-by%3Akentcdodds" title="Reviewed Pull Requests">👀</a>'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('format contributor with pipes in their name', () => {
  const contributor = contributors.pipey
  const {options} = fixtures()

  const expected =
    '<a href="http://github.com/chrisinajar"><img src="https://avatars1.githubusercontent.com/u/1500684?s=150" width="150px;" alt="Who &#124; Needs &#124; Pipes?"/><br /><sub><b>Who &#124; Needs &#124; Pipes?</b></sub></a><br /><a href="https://github.com/all-contributors/all-contributors-cli/commits?author=pipey" title="Documentation">📖</a>'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('format contributor with no GitHub account', () => {
  const contributor = contributors.nologin
  const {options} = fixtures()

  const expected =
    '<img src="https://avatars1.githubusercontent.com/u/1500684?s=150" width="150px;" alt="No Github Account"/><br /><sub><b>No Github Account</b></sub><br /><a href="#translation" title="Translation">🌍</a>'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('format contributor with no complete name', () => {
  const contributor = contributors.nocompletename
  const {options} = fixtures()

  const expected =
    '<img src="https://avatars1.githubusercontent.com/u/1500684?s=150" width="150px;" alt="nocompletename"/><br /><sub><b>nocompletename</b></sub><br /><a href="#translation-nocompletename" title="Translation">🌍</a>'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('format contributor with quotes in name', () => {
  const contributor = contributors.name_with_quotes
  const {options} = fixtures()

  const expected =
    '<a href="http://github.com/namelastname"><img src="https://avatars1.githubusercontent.com/u/1500684?s=150" width="150px;" alt="Name &quot;Nickname&quot; Lastname"/><br /><sub><b>Name &quot;Nickname&quot; Lastname</b></sub></a><br /><a href="https://github.com/all-contributors/all-contributors-cli/commits?author=namelastname" title="Documentation">📖</a>'
  expect(formatContributor(options, contributor)).toBe(expected)
})
