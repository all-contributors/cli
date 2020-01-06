import addContributor from '../add'
import fixtures from './fixtures'

function mockInfoFetcher(username) {
  return Promise.resolve({
    login: username,
    name: 'Some name',
    avatar_url: 'www.avatar.url',
    profile: 'www.profile.url',
  })
}

function caseFixtures() {
  const options = {
    contributors: [
      {
        login: 'Login1',
        name: 'Some name',
        avatar_url: 'www.avatar.url',
        profile: 'www.profile.url',
        contributions: ['code'],
      },
    ],
  }
  return {options}
}

test('callback with error if infoFetcher fails', async () => {
  const {options} = fixtures()
  const username = 'login3'
  const contributions = ['doc']
  const error = new Error('infoFetcher error')
  function infoFetcher() {
    return Promise.reject(error)
  }
  const resolvedError = await addContributor(
    options,
    username,
    contributions,
    infoFetcher,
  ).catch(e => e)

  expect(resolvedError).toBe(error)
})

test('add new contributor at the end of the list of contributors', () => {
  const {options} = fixtures()
  const username = 'login3'
  const contributions = ['doc']

  return addContributor(options, username, contributions, mockInfoFetcher).then(
    contributors => {
      expect(contributors).toHaveLength(options.contributors.length + 1)
      expect(contributors[options.contributors.length]).toEqual({
        login: 'login3',
        name: 'Some name',
        avatar_url: 'www.avatar.url',
        profile: 'www.profile.url',
        contributions: ['doc'],
      })
    },
  )
})

test('add new contributor at the end of the list of contributors with a url link', () => {
  const {options} = fixtures()
  const username = 'login3'
  const contributions = ['doc']
  options.url = 'www.foo.bar'

  return addContributor(options, username, contributions, mockInfoFetcher).then(
    contributors => {
      expect(contributors).toHaveLength(options.contributors.length + 1)
      expect(contributors[options.contributors.length]).toEqual({
        login: 'login3',
        name: 'Some name',
        avatar_url: 'www.avatar.url',
        profile: 'www.profile.url',
        contributions: [{type: 'doc', url: 'www.foo.bar'}],
      })
    },
  )
})

test(`should not update an existing contributor's contributions where nothing has changed`, () => {
  const {options} = fixtures()
  const username = 'login2'
  const contributions = ['blog', 'code']

  return addContributor(options, username, contributions, mockInfoFetcher).then(
    contributors => {
      expect(contributors).toEqual(options.contributors)
    },
  )
})

test(`should not update an existing contributor's contributions where nothing has changed but the casing`, () => {
  const {options} = caseFixtures()
  const username = 'login1'
  const contributions = ['code']

  return addContributor(options, username, contributions, mockInfoFetcher).then(
    contributors => {
      expect(contributors).toEqual(options.contributors)
    },
  )
})

test(`should update an existing contributor's contributions if a new type is added`, () => {
  const {options} = fixtures()
  const username = 'login1'
  const contributions = ['bug']
  return addContributor(options, username, contributions, mockInfoFetcher).then(
    contributors => {
      expect(contributors).toHaveLength(options.contributors.length)
      expect(contributors[0]).toEqual({
        login: 'login1',
        name: 'Some name',
        avatar_url: 'www.avatar.url',
        profile: 'www.profile.url',
        contributions: ['code', 'bug'],
      })
    },
  )
})

test(`should update an existing contributor's contributions if a new type is added with different username case`, () => {
  const {options} = caseFixtures()
  const username = 'login1'
  const contributions = ['bug']
  return addContributor(options, username, contributions, mockInfoFetcher).then(
    contributors => {
      expect(contributors).toHaveLength(1)
      expect(contributors[0]).toEqual({
        login: 'Login1',
        name: 'Some name',
        avatar_url: 'www.avatar.url',
        profile: 'www.profile.url',
        contributions: ['code', 'bug'],
      })
    },
  )
})

test(`should update an existing contributor's contributions if a new type is added with a link`, () => {
  const {options} = fixtures()
  const username = 'login1'
  const contributions = ['bug']
  options.url = 'www.foo.bar'

  return addContributor(options, username, contributions, mockInfoFetcher).then(
    contributors => {
      expect(contributors).toHaveLength(options.contributors.length)
      expect(contributors[0]).toEqual({
        login: 'login1',
        name: 'Some name',
        avatar_url: 'www.avatar.url',
        profile: 'www.profile.url',
        contributions: ['code', {type: 'bug', url: 'www.foo.bar'}],
      })
    },
  )
})

test(`should update an existing contributor's contributions if an existing type is removed`, () => {
  const {options} = fixtures()
  const username = 'login2'
  const contributions = ['code']

  return addContributor(options, username, contributions, mockInfoFetcher).then(
    contributors => {
      expect(contributors).toHaveLength(options.contributors.length)
      expect(contributors[1]).toEqual({
        login: 'login2',
        name: 'Some name',
        avatar_url: 'www.avatar.url',
        profile: 'www.profile.url',
        contributions: ['code'],
      })
    },
  )
})
