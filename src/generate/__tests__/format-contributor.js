import _ from 'lodash/fp'
import formatContributor from '../format-contributor'
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
  const contributor = _.assign(contributors.kentcdodds, {
    contributions: ['review'],
  })
  const {options} = fixtures()

  const expected =
    '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="150px;" alt="Kent C. Dodds"/><br /><sub><b>Kent C. Dodds</b></sub>](http://kentcdodds.com)<br />[👀](#review-kentcdodds "Reviewed Pull Requests")'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('format contributor with complex contribution types', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()

  const expected =
    '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="150px;" alt="Kent C. Dodds"/><br /><sub><b>Kent C. Dodds</b></sub>](http://kentcdodds.com)<br />[📖](https://github.com/all-contributors/all-contributors-cli/commits?author=kentcdodds "Documentation") [👀](#review-kentcdodds "Reviewed Pull Requests") [💬](#question-kentcdodds "Answering Questions")'

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
  const contributor = _.assign(contributors.kentcdodds, {
    contributions: ['review'],
  })
  const {options} = fixtures()
  delete options.imageSize

  const expected =
    '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="100px;" alt="Kent C. Dodds"/><br /><sub><b>Kent C. Dodds</b></sub>](http://kentcdodds.com)<br />[👀](#review-kentcdodds "Reviewed Pull Requests")'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('format contributor with pipes in their name', () => {
  const contributor = contributors.pipey
  const {options} = fixtures()

  const expected =
    '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="150px;" alt="Who &#124; Needs &#124; Pipes?"/><br /><sub><b>Who &#124; Needs &#124; Pipes?</b></sub>](http://github.com/chrisinajar)<br />[📖](https://github.com/all-contributors/all-contributors-cli/commits?author=pipey "Documentation")'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('format contributor with no github account', () => {
  const contributor = contributors.nologin
  const {options} = fixtures()

  const expected =
    '<img src="https://avatars1.githubusercontent.com/u/1500684" width="150px;" alt="No Github Account"/><br /><sub><b>No Github Account</b></sub><br />[🌍](#translation "Translation")'

  expect(formatContributor(options, contributor)).toBe(expected)
})
