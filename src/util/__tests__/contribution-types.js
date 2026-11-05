import {test, expect} from 'vitest'
import {contributionTypes} from '../contribution-types.js'

test('links built-in types to the repo type pages', () => {
  const types = contributionTypes({repoType: 'gitlab'})

  expect(types.code.link).toContain('/commits/master')
  expect(types.bug.link).toContain('/issues?author_username=')
  expect(types.review.link).toContain('/merge_requests?')
  expect(types.ideas).toEqual({
    description: 'Ideas, Planning, & Feedback',
    symbol: '🤔',
  })
})

test('uses a null link for unknown repo types', () => {
  expect(contributionTypes({repoType: 'unknown'}).code.link).toBeNull()
})

test('lets custom types override built-in types', () => {
  const custom = {symbol: '🧪', description: 'Custom'}

  expect(contributionTypes({types: {code: custom}}).code).toBe(custom)
})

test('returns new type objects on each call', () => {
  const options = {repoType: 'github'}

  contributionTypes(options).audio.description = 'Mutated'

  expect(contributionTypes(options).audio.description).toBe('Audio')
})
