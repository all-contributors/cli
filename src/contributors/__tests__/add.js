import {test, expect, vi} from 'vitest'
import addContributor from '../add.js'
import fixtures from './fixtures/index.js'

/**
 * Mock function that simulates fetching contributor info from an API.
 * Returns a promise resolving to contributor data without making real API calls.
 *
 * @param {string} username - GitHub username to fetch
 * @returns {Promise<Object>} Contributor info (login, name, avatar_url, profile)
 */
function mockInfoFetcher(username) {
  return Promise.resolve({
    login: username,
    name: 'Some name',
    avatar_url: 'www.avatar.url',
    profile: 'www.profile.url',
  })
}

/**
 * Returns test options with one contributor that has a capitalized login ('Login1').
 * Used for testing that case-insensitive username matching works correctly.
 *
 * @returns {Object} Options object with contributors array containing one entry
 */
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

/**
 * Tests that addContributor properly propagates errors when infoFetcher rejects.
 * The same error should be returned without being swallowed or transformed.
 */
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

/**
 * Tests that addContributor calls infoFetcher with the correct arguments
 * (username, repoType, and repoHost) when adding a new contributor.
 * This ensures repository metadata is properly passed for API URL construction.
 */
test('calls infoFetcher with (username, options.repoType, options.repoHost) when adding new contributor', async () => {
  const {options} = fixtures()
  options.repoType = 'github'
  options.repoHost = 'https://github.com'
  const username = 'newuser'
  const contributions = ['doc']
  const infoFetcher = vi.fn().mockResolvedValue({
    login: username,
    name: 'New User',
    avatar_url: '',
    profile: '',
  })

  await addContributor(options, username, contributions, infoFetcher)

  expect(infoFetcher).toHaveBeenCalledWith(
    username,
    'github',
    'https://github.com',
  )
})

/**
 * Tests that a new contributor is added to the end of the existing contributors list
 * with all required fields (login, name, avatar_url, profile, contributions).
 */
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

/**
 * Tests that contributions are stored as objects with type and url properties
 * when options.url is provided, allowing contributions to link to specific resources.
 */
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

/**
 * Tests that addContributor responds accordingly when a contributor already has
 * the exact same contribution types. The contributors list should remain unchanged.
 */
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

/**
 * Tests that username matching is case-insensitive. Adding contributions for 'login1'
 * should match an existing 'Login1' contributor without creating duplicates.
 */
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

/**
 * Tests that adding a new contribution type to an existing contributor
 * updates their contributions array while keeping the list length unchanged.
 */
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

/**
 * Tests that case-insensitive matching works when updating contributions.
 * Adding 'bug' for 'login1' should update 'Login1' while preserving the original casing.
 */
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

/**
 * Tests that when adding a new contribution type with options.url set,
 * the new contribution is stored as an object with type and url properties.
 */
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

/**
 * Tests that passing a subset of a contributor's current contributions
 * replaces (not merges with) their contribution list, allowing removal of types.
 */
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
