import _ from 'lodash/fp'
import formatContributor from '../format-contributor'
import contributors from './fixtures/contributors.json'

function fixtures() {
  const options = {
    projectOwner: 'jfmengels',
    projectName: 'all-contributors-cli',
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
    '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="150px;"/><br /><sub><b>Kent C. Dodds</b></sub>](http://kentcdodds.com)<br />[👀](#review-kentcdodds "Reviewed Pull Requests")'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('format contributor with complex contribution types', () => {
  const contributor = contributors.kentcdodds
  const {options} = fixtures()

  const expected =
    '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="150px;"/><br /><sub><b>Kent C. Dodds</b></sub>](http://kentcdodds.com)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=kentcdodds "Documentation") [👀](#review-kentcdodds "Reviewed Pull Requests") [💬](#question-kentcdodds "Answering Questions")'

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
    '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="100px;"/><br /><sub><b>Kent C. Dodds</b></sub>](http://kentcdodds.com)<br />[👀](#review-kentcdodds "Reviewed Pull Requests")'

  expect(formatContributor(options, contributor)).toBe(expected)
})

test('format contributor with pipes in their name', () => {
  const contributor = contributors.pipey
  const {options} = fixtures()

  const expected =
    '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="150px;"/><br /><sub><b>Who &#124; Needs &#124; Pipes?</b></sub>](http://github.com/chrisinajar)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=pipey "Documentation")'

  expect(formatContributor(options, contributor)).toBe(expected)
})
