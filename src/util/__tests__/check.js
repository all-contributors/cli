import nock from 'nock'
import check from '../check'

import allContributorsCliResponse from './fixtures/all-contributors.response.json'
import allContributorsCliTransformed from './fixtures/all-contributors.transformed.json'

import reactNativeResponse1 from './fixtures/react-native.response.1.json'
import reactNativeResponse2 from './fixtures/react-native.response.2.json'
import reactNativeResponse3 from './fixtures/react-native.response.3.json'
import reactNativeResponse4 from './fixtures/react-native.response.4.json'
import reactNativeTransformed from './fixtures/react-native.transformed.json'

beforeAll(() => {
  nock('https://api.github.com')
    .persist()
    .get('/repos/jfmengels/all-contributors-cli/contributors?per_page=100')
    .reply(200, allContributorsCliResponse)
    .get('/repos/facebook/react-native/contributors?per_page=100')
    .reply(200, reactNativeResponse1, {
      Link:
        '<https://api.github.com/repositories/29028775/contributors?per_page=100&page=2>; rel="next", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=4>; rel="last"',
    })
    .get('/repositories/29028775/contributors?per_page=100&page=2')
    .reply(200, reactNativeResponse2, {
      Link:
        '<https://api.github.com/repositories/29028775/contributors?per_page=100&page=3>; rel="next", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=4>; rel="last", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=1>; rel="first", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=1>; rel="prev"',
    })
    .get('/repositories/29028775/contributors?per_page=100&page=3')
    .reply(200, reactNativeResponse3, {
      Link:
        '<https://api.github.com/repositories/29028775/contributors?per_page=100&page=4>; rel="next", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=4>; rel="last", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=1>; rel="first", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=2>; rel="prev"',
    })
    .get('/repositories/29028775/contributors?per_page=100&page=4')
    .reply(200, reactNativeResponse4, {
      Link:
        '<https://api.github.com/repositories/29028775/contributors?per_page=100&page=1>; rel="first", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=3>; rel="prev"',
    })
})

test('Handle a single results page correctly', async () => {
  const transformed = await check('jfmengels', 'all-contributors-cli')
  expect(transformed).toEqual(allContributorsCliTransformed)
})

test('Handle multiple results pages correctly', async () => {
  const transformed = await check('facebook', 'react-native')
  expect(transformed).toEqual(reactNativeTransformed)
})
