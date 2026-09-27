import {test, expect, describe} from 'vitest'
import {addContributorWithDetails} from '../addWithDetails.js'
import fixtures from './fixtures/index.js'

describe('addContributorWithDetails', () => {
  test('add new contributor without going to the network', async () => {
    const {options} = fixtures()
    const userDetails = {
      login: 'jakebolam',
      contributions: ['code', 'security'],
      name: 'Jake Bolam',
      avatar_url: 'my-avatar.example.com',
      profile: 'jakebolam.com',
    }

    const contributors = await addContributorWithDetails({
      options,
      login: userDetails.login,
      contributions: userDetails.contributions,
      name: userDetails.name,
      avatar_url: userDetails.avatar_url,
      profile: userDetails.profile,
    })

    expect(contributors).toHaveLength(options.contributors.length + 1)
    expect(contributors[options.contributors.length]).toEqual(userDetails)
  })

  test('update existing contributor with additional contribution types', async () => {
    const {options} = fixtures()
    const updateDetails = {
      login: 'login1',
      contributions: ['bug', 'doc'],
      name: 'Some name',
      avatar_url: 'www.avatar.url',
      profile: 'www.profile.url',
    }

    const contributors = await addContributorWithDetails({
      options,
      login: updateDetails.login,
      contributions: updateDetails.contributions,
      name: updateDetails.name,
      avatar_url: updateDetails.avatar_url,
      profile: updateDetails.profile,
    })

    expect(contributors).toHaveLength(options.contributors.length)
    expect(contributors[0]).toEqual({
      login: 'login1',
      name: 'Some name',
      avatar_url: 'www.avatar.url',
      profile: 'www.profile.url',
      contributions: ['code', 'bug', 'doc'],
    })
  })

  test('update existing contributor case-insensitively', async () => {
    const {options} = fixtures()
    const updateDetails = {
      login: 'LOGIN1',
      contributions: ['infra'],
      name: 'Some name',
      avatar_url: 'www.avatar.url',
      profile: 'www.profile.url',
    }

    const contributors = await addContributorWithDetails({
      options,
      login: updateDetails.login,
      contributions: updateDetails.contributions,
      name: updateDetails.name,
      avatar_url: updateDetails.avatar_url,
      profile: updateDetails.profile,
    })

    expect(contributors).toHaveLength(options.contributors.length)
    expect(contributors[0].contributions).toEqual(['code', 'infra'])
  })

  test('add contributor with custom contribution url via options.url', async () => {
    const {options} = fixtures()
    const optionsWithUrl = {
      ...options,
      url: 'https://github.com/all-contributors/all-contributors/pull/1',
    }

    const contributors = await addContributorWithDetails({
      options: optionsWithUrl,
      login: 'customurluser',
      contributions: ['pr'],
      name: 'Custom User',
      avatar_url: 'https://avatar.example.com',
      profile: 'https://profile.example.com',
    })

    const added = contributors.find(c => c.login === 'customurluser')
    expect(added).toBeDefined()
    expect(added.contributions).toEqual([
      {
        type: 'pr',
        url: 'https://github.com/all-contributors/all-contributors/pull/1',
      },
    ])
  })

  test('handles empty initial contributors list gracefully', async () => {
    const options = {contributors: []}
    const userDetails = {
      login: 'firstuser',
      contributions: ['code'],
      name: 'First User',
      avatar_url: 'https://avatar.first.example.com',
      profile: 'https://first.example.com',
    }

    const contributors = await addContributorWithDetails({
      options,
      login: userDetails.login,
      contributions: userDetails.contributions,
      name: userDetails.name,
      avatar_url: userDetails.avatar_url,
      profile: userDetails.profile,
    })

    expect(contributors).toHaveLength(1)
    expect(contributors[0]).toEqual(userDetails)
  })
})
