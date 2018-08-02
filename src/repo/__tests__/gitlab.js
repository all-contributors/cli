import nock from 'nock'
import gitlabAPI from '../gitlab'

const getUserInfo = gitlabAPI.getUserInfo

async function rejects(promise) {
  const error = await promise.catch(e => e)
  expect(error).toBeTruthy()
}

test('handle errors', async () => {
  nock('https://gitlab.com')
    .get('/api/v4/users?username=nodisplayname')
    .reply(200, [])

  await rejects(getUserInfo('nodisplayname'))
})

test('fill in the name when it is returned', async () => {
  nock('https://gitlab.com')
    .get('/api/v4/users?username=nodisplayname')
    .reply(200, [
      {
        username: 'nodisplayname',
        name: 'No Display Name',
        avatar_url:
          'http://www.gravatar.com/avatar/3186450a99d1641bf75a44baa23f0826?s=80\u0026d=identicon',
        web_url: 'https://gitlab.com/nodisplayname',
      },
    ])

  const info = await getUserInfo('nodisplayname')
  expect(info.name).toBe('No Display Name')
})

test('fill in the name when null is returned', async () => {
  nock('https://gitlab.com')
    .get('/api/v4/users?username=nodisplayname')
    .reply(200, [
      {
        username: 'nodisplayname',
        name: null,
        avatar_url:
          'http://www.gravatar.com/avatar/3186450a99d1641bf75a44baa23f0826?s=80\u0026d=identicon',
        web_url: 'https://gitlab.com/nodisplayname',
      },
    ])

  const info = await getUserInfo('nodisplayname')
  expect(info.name).toBe('nodisplayname')
})

test('fill in the name when an empty string is returned', async () => {
  nock('https://gitlab.com')
    .get('/api/v4/users?username=nodisplayname')
    .reply(200, [
      {
        username: 'nodisplayname',
        name: '',
        avatar_url:
          'http://www.gravatar.com/avatar/3186450a99d1641bf75a44baa23f0826?s=80\u0026d=identicon',
        web_url: 'https://gitlab.com/nodisplayname',
      },
    ])

  const info = await getUserInfo('nodisplayname')
  expect(info.name).toBe('nodisplayname')
})

test('append http when no absolute link is provided', async () => {
  nock('https://gitlab.com')
    .get('/api/v4/users?username=nodisplayname')
    .reply(200, [
      {
        username: 'nodisplayname',
        name: 'No Display Name',
        avatar_url:
          'http://www.gravatar.com/avatar/3186450a99d1641bf75a44baa23f0826?s=80\u0026d=identicon',
        web_url: 'www.gitlab.com/nodisplayname',
      },
    ])

  const info = await getUserInfo('nodisplayname')
  expect(info.profile).toBe('http://www.gitlab.com/nodisplayname')
})

test('retrieve user from a different gitlab registry', async () => {
  nock('http://gitlab.myhost.com:3000')
    .get('/api/v4/users?username=nodisplayname')
    .reply(200, [
      {
        username: 'nodisplayname',
        name: 'No Display Name',
        avatar_url:
          'http://www.gravatar.com/avatar/3186450a99d1641bf75a44baa23f0826?s=80\u0026d=identicon',
        web_url: 'https://gitlab.com/nodisplayname',
      },
    ])

  const info = await getUserInfo(
    'nodisplayname',
    'http://gitlab.myhost.com:3000',
  )
  expect(info.name).toBe('No Display Name')
})

test('retrieve user from a gitlab registry that needs a token', async () => {
  nock('http://gitlab.needtoken.com:3000')
    .get('/api/v4/users?username=nodisplayname&private_token=faketoken')
    .reply(200, [
      {
        username: 'nodisplayname',
        name: 'No Display Name',
        avatar_url:
          'http://www.gravatar.com/avatar/3186450a99d1641bf75a44baa23f0826?s=80\u0026d=identicon',
        web_url: 'https://gitlab.com/nodisplayname',
      },
    ])

  const info = await getUserInfo(
    'nodisplayname',
    'http://gitlab.needtoken.com:3000',
    'faketoken',
  )
  expect(info.name).toBe('No Display Name')
})

test('handle error when no token is offered', async () => {
  nock('http://gitlab.needtoken.com:3000')
    .get('/api/v4/users?username=nodisplayname')
    .reply(200, [])

  await rejects(
    getUserInfo('nodisplayname', 'http://gitlab.needtoken.com:3000', ''),
  )
})
