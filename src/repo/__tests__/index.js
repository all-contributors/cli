import {test, expect, beforeEach} from 'vitest'
import nock from 'nock'
import * as repo from '../index.js'

beforeEach(() => {
  nock.cleanAll()
})

test('get choices for init command', () => {
  expect(repo.getChoices()).toEqual([
    {
      value: 'github',
      name: 'GitHub',
    },
    {
      value: 'gitlab',
      name: 'GitLab',
    },
  ])
})

test('get hostname for a given repo type', () => {
  expect(repo.getHostname('github')).toEqual('https://github.com')
  expect(repo.getHostname('github', 'http://my-github.com')).toEqual(
    'http://my-github.com',
  )
  expect(repo.getHostname('gitlab')).toEqual('https://gitlab.com')
  expect(repo.getHostname('gitlab', 'http://my-gitlab.com:3000')).toEqual(
    'http://my-gitlab.com:3000',
  )
  expect(repo.getHostname('other')).toBe(null)
})

test('get repo name given a repo type', () => {
  expect(repo.getTypeName('github')).toEqual('GitHub')
  expect(repo.getTypeName('gitlab')).toEqual('GitLab')
  expect(repo.getTypeName('other')).toBe(null)
})

test('get user info calls underlying APIs', async () => {
  nock('https://api.github.com').get('/users/nodisplayname').reply(200, {
    login: 'nodisplayname',
    name: 'nodisplayname',
    avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
    html_url: 'https://github.com/nodisplayname',
  })

  nock('https://gitlab.com')
    .get('/api/v4/users?username=nodisplayname')
    .reply(200, [
      {
        username: 'nodisplayname',
        name: 'nodisplayname',
        avatar_url:
          'http://www.gravatar.com/avatar/3186450a99d1641bf75a44baa23f0826?s=80\u0026d=identicon',
        web_url: 'https://gitlab.com/nodisplayname',
      },
    ])

  expect(await repo.getUserInfo('nodisplayname', 'github')).toEqual({
    login: 'nodisplayname',
    name: 'nodisplayname',
    avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
    profile: 'https://github.com/nodisplayname',
  })
  expect(await repo.getUserInfo('nodisplayname', 'gitlab')).toEqual({
    login: 'nodisplayname',
    name: 'nodisplayname',
    avatar_url:
      'http://www.gravatar.com/avatar/3186450a99d1641bf75a44baa23f0826?s=80\u0026d=identicon',
    profile: 'https://gitlab.com/nodisplayname',
  })
  expect(await repo.getUserInfo('nodisplayname', 'other')).toBe(null)
})
