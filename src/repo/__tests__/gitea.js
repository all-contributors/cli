import {test, expect, beforeEach} from 'vitest'
import nock from 'nock'
import * as giteaAPI from '../gitea.js'

beforeEach(() => {
  nock.cleanAll()
})

test('getUserInfo throws error if username is empty', async () => {
  await expect(giteaAPI.getUserInfo('')).rejects.toThrow(
    'No login when adding a contributor. Please specify a username.',
  )
})

test('getUserInfo returns user profile when user exists', async () => {
  nock('https://codeberg.org').get('/api/v1/users/testuser').reply(200, {
    login: 'testuser',
    full_name: 'Test User',
    avatar_url: 'https://codeberg.org/avatars/12345',
    website: 'https://testuser.org',
    html_url: 'https://codeberg.org/testuser',
  })

  const user = await giteaAPI.getUserInfo('testuser', 'https://codeberg.org')
  expect(user).toEqual({
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://codeberg.org/avatars/12345',
    profile: 'https://testuser.org/',
  })
})

test('getUserInfo falls back to html_url or hostname when website is empty', async () => {
  nock('https://gitea.com').get('/api/v1/users/noname').reply(200, {
    login: 'noname',
    full_name: null,
    avatar_url: 'https://gitea.com/avatars/6789',
    website: '',
    html_url: 'https://gitea.com/noname',
  })

  const user = await giteaAPI.getUserInfo('noname', 'https://gitea.com')
  expect(user).toEqual({
    login: 'noname',
    name: 'noname',
    avatar_url: 'https://gitea.com/avatars/6789',
    profile: 'https://gitea.com/noname',
  })
})

test('getUserInfo sends privateToken when provided', async () => {
  nock('https://codeberg.org', {
    reqheaders: {
      authorization: 'token secret123',
    },
  })
    .get('/api/v1/users/autheduser')
    .reply(200, {
      login: 'autheduser',
      full_name: 'Authed User',
      avatar_url: 'https://codeberg.org/avatars/auth',
      html_url: 'https://codeberg.org/autheduser',
    })

  const user = await giteaAPI.getUserInfo(
    'autheduser',
    'https://codeberg.org',
    'secret123',
  )
  expect(user.login).toBe('autheduser')
})

test('getUserInfo throws authentication error on 401', async () => {
  nock('https://codeberg.org')
    .get('/api/v1/users/secretuser')
    .reply(401, {message: 'unauthorized'})

  await expect(
    giteaAPI.getUserInfo('secretuser', 'https://codeberg.org'),
  ).rejects.toThrow(
    'Missing authentication for API. Did you set PRIVATE_TOKEN?',
  )
})

test('getUserInfo throws error when user is not found (404)', async () => {
  nock('https://codeberg.org')
    .get('/api/v1/users/unknownuser')
    .reply(404, {message: 'user does not exist'})

  await expect(
    giteaAPI.getUserInfo('unknownuser', 'https://codeberg.org'),
  ).rejects.toThrow(
    "The username unknownuser doesn't exist on https://codeberg.org.",
  )
})

test('getContributors extracts unique authors from commits', async () => {
  nock('https://codeberg.org')
    .get('/api/v1/repos/myorg/myrepo/commits?limit=100')
    .reply(200, [
      {
        author: {login: 'alice'},
      },
      {
        author: {login: 'bob'},
      },
      {
        author: {login: 'alice'}, // duplicate
      },
      {
        author: null,
        commit: {author: {name: 'charlie'}}, // git author fallback
      },
    ])

  const contributors = await giteaAPI.getContributors(
    'myorg',
    'myrepo',
    'https://codeberg.org',
  )
  expect(contributors).toEqual(['alice', 'bob', 'charlie'])
})

test('getContributors follows pagination link header', async () => {
  nock('https://codeberg.org')
    .get('/api/v1/repos/myorg/myrepo/commits?limit=100')
    .reply(200, [{author: {login: 'alice'}}], {
      link: '<https://codeberg.org/api/v1/repos/myorg/myrepo/commits?limit=100&page=2>; rel="next"',
    })

  nock('https://codeberg.org')
    .get('/api/v1/repos/myorg/myrepo/commits?limit=100&page=2')
    .reply(200, [{author: {login: 'bob'}}])

  const contributors = await giteaAPI.getContributors(
    'myorg',
    'myrepo',
    'https://codeberg.org',
  )
  expect(contributors).toEqual(['alice', 'bob'])
})

test('getContributors throws when repo is not found', async () => {
  nock('https://codeberg.org')
    .get('/api/v1/repos/myorg/nonexistent/commits?limit=100')
    .reply(404)

  await expect(
    giteaAPI.getContributors('myorg', 'nonexistent', 'https://codeberg.org'),
  ).rejects.toThrow('No contributors found on the repository')
})
