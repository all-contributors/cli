import {test, expect, beforeAll} from 'vitest'
import nock from 'nock'
import * as githubAPI from '../github.js'

import allContributorsCliResponse from './github/all-contributors.response.json'
import allContributorsCliTransformed from './github/all-contributors.transformed.json'

import reactNativeResponse1 from './github/react-native.response.1.json'
import reactNativeResponse2 from './github/react-native.response.2.json'
import reactNativeResponse3 from './github/react-native.response.3.json'
import reactNativeResponse4 from './github/react-native.response.4.json'
import reactNativeTransformed from './github/react-native.transformed.json'

const getUserInfo = githubAPI.getUserInfo
const check = githubAPI.getContributors

beforeAll(() => {
  nock('https://api.github.com')
    .persist()
    .get(
      '/repos/all-contributors/all-contributors-cli/contributors?per_page=100',
    )
    .reply(200, allContributorsCliResponse)
    .get('/repos/facebook/react-native/contributors?per_page=100')
    .reply(200, reactNativeResponse1, {
      Link: '<https://api.github.com/repositories/29028775/contributors?per_page=100&page=2>; rel="next", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=4>; rel="last"',
    })
    .get('/repositories/29028775/contributors?per_page=100&page=2')
    .reply(200, reactNativeResponse2, {
      Link: '<https://api.github.com/repositories/29028775/contributors?per_page=100&page=3>; rel="next", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=4>; rel="last", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=1>; rel="first", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=1>; rel="prev"',
    })
    .get('/repositories/29028775/contributors?per_page=100&page=3')
    .reply(200, reactNativeResponse3, {
      Link: '<https://api.github.com/repositories/29028775/contributors?per_page=100&page=4>; rel="next", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=4>; rel="last", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=1>; rel="first", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=2>; rel="prev"',
    })
    .get('/repositories/29028775/contributors?per_page=100&page=4')
    .reply(200, reactNativeResponse4, {
      Link: '<https://api.github.com/repositories/29028775/contributors?per_page=100&page=1>; rel="first", <https://api.github.com/repositories/29028775/contributors?per_page=100&page=3>; rel="prev"',
    })
})

test('Handle a single results page correctly', async () => {
  const transformed = await check('all-contributors', 'all-contributors-cli')
  expect(transformed).toEqual(allContributorsCliTransformed)
})

test('Handle multiple results pages correctly', async () => {
  const transformed = await check('facebook', 'react-native')
  expect(transformed).toEqual(reactNativeTransformed)
})

async function rejects(promise) {
  const error = await promise.catch(e => e)
  expect(error).toBeTruthy()
}

// When we move to vitest this might not be an issue anymore
// eslint-disable-next-line vitest/expect-expect
test('handle errors', async () => {
  nock('https://api.github.com').get('/users/nodisplayname').replyWithError(404)

  await rejects(getUserInfo('nodisplayname'))
})

test('Throw error when no username is provided', () => {
  expect(getUserInfo).toThrow(
    'No login when adding a contributor. Please specify a username.',
  )
})

test('Throw error when non existent username is provided', async () => {
  const username = 'thisusernamedoesntexist'
  nock('https://api.github.com').get(`/users/${username}`).reply(404, {
    message: 'Not Found',
    documentation_url:
      'https://developer.github.com/v3/users/#get-a-single-user',
  })
  await expect(getUserInfo(username)).rejects.toThrow(
    `The username ${username} doesn't exist on GitHub.`,
  )
})

test('Throw error when missing enterprise authentication', async () => {
  const username = 'notauthenticated'
  nock('http://github.myhost.com:3000/api/v3')
    .get(`/users/${username}`)
    .reply(401, {
      message: 'Must authenticate to access this API.',
      documentation_url: 'https://developer.github.com/enterprise/2.17/v3',
    })
  await expect(
    getUserInfo(username, 'http://github.myhost.com:3000'),
  ).rejects.toThrow(
    `Missing authentication for GitHub API. Did you set PRIVATE_TOKEN?`,
  )
})

test('handle API rate GitHub errors', async () => {
  const githubErrorMessage =
    "API rate limit exceeded for 0.0.0.0. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details."
  nock('https://api.github.com').get('/users/nodisplayname').reply(200, {
    message: githubErrorMessage,
    documentation_url: 'https://developer.github.com/v3/#rate-limiting',
  })

  await expect(getUserInfo('nodisplayname')).rejects.toThrow(githubErrorMessage)
})

test('fill in the name when null is returned', async () => {
  nock('https://api.github.com').get('/users/nodisplayname').reply(200, {
    login: 'nodisplayname',
    name: null,
    avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
    html_url: 'https://github.com/nodisplayname',
  })

  const info = await getUserInfo('nodisplayname')
  expect(info.name).toBe('nodisplayname')
})

// When we move to vitest this might not be an issue anymore
// eslint-disable-next-line vitest/expect-expect
test('attaches token when supplied', async () => {
  const mockAuthToken = 'myMock-token-adaskjda'
  nock('https://api.github.com')
    .matchHeader('authorization', `token ${mockAuthToken}`)
    .get('/users/test-token')
    .reply(200, {
      html_url: 'test-token',
    })

  await getUserInfo('test-token', 'https://github.com', mockAuthToken)
})

// When we move to vitest this might not be an issue anymore
// eslint-disable-next-line vitest/expect-expect
test('attaches no token when supplied empty', async () => {
  nock('https://api.github.com')
    .matchHeader('authorization', '')
    .get('/users/test-token')
    .reply(200, {
      html_url: 'test-token',
    })

  await getUserInfo('test-token', 'https://github.com', '')
})

// When we move to vitest this might not be an issue anymore
// eslint-disable-next-line vitest/expect-expect
test('attaches no token when not supplied', async () => {
  nock('https://api.github.com')
    .matchHeader('authorization', '')
    .get('/users/test-token')
    .reply(200, {
      html_url: 'test-token',
    })

  await getUserInfo('test-token')
})

test('fill in the name when an empty string is returned', async () => {
  nock('https://api.github.com').get('/users/nodisplayname').reply(200, {
    login: 'nodisplayname',
    name: '',
    avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
    html_url: 'https://github.com/nodisplayname',
  })

  const info = await getUserInfo('nodisplayname')
  expect(info.name).toBe('nodisplayname')
})

test('append http when no absolute link is provided', async () => {
  nock('https://api.github.com').get('/users/nodisplayname').reply(200, {
    login: 'nodisplayname',
    name: '',
    avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
    html_url: 'www.github.com/nodisplayname',
  })

  const info = await getUserInfo('nodisplayname')
  expect(info.profile).toBe('http://www.github.com/nodisplayname')
})

test('retrieve user from a different GitHub registry', async () => {
  nock('http://github.myhost.com:3000/api/v3')
    .get('/users/nodisplayname')
    .reply(200, {
      login: 'nodisplayname',
      name: 'No Display Name',
      avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
      html_url: 'http://github.myhost.com:3000/nodisplayname',
    })

  const info = await getUserInfo(
    'nodisplayname',
    'http://github.myhost.com:3000',
  )
  expect(info.name).toBe('No Display Name')
})
