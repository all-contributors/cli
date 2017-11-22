import nock from 'nock'
import getUserInfo from '../github'

async function rejects(promise) {
  const error = await promise.catch(e => e)
  expect(error).toBeTruthy()
}

test('handle errors', async () => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .replyWithError(404)

  await rejects(getUserInfo('nodisplayname'))
})

test('handle github errors', async () => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .reply(200, {
      message:
        "API rate limit exceeded for 0.0.0.0. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)",
      documentation_url: 'https://developer.github.com/v3/#rate-limiting',
    })

  await rejects(getUserInfo('nodisplayname'))
})

test('fill in the name when null is returned', async () => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .reply(200, {
      login: 'nodisplayname',
      name: null,
      avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
      html_url: 'https://github.com/nodisplayname',
    })

  const info = await getUserInfo('nodisplayname')
  expect(info.name).toBe('nodisplayname')
})

test('fill in the name when an empty string is returned', async () => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .reply(200, {
      login: 'nodisplayname',
      name: '',
      avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
      html_url: 'https://github.com/nodisplayname',
    })

  const info = await getUserInfo('nodisplayname')
  expect(info.name).toBe('nodisplayname')
})

test('append http when no absolute link is provided', async () => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .reply(200, {
      login: 'nodisplayname',
      name: '',
      avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
      html_url: 'www.github.com/nodisplayname',
    })

  const info = await getUserInfo('nodisplayname')
  expect(info.profile).toBe('http://www.github.com/nodisplayname')
})
