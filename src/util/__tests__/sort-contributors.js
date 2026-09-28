import {test, expect} from 'vitest'
import {sortContributors} from '../sort-contributors.js'

const sampleContributors = [
  {login: 'charlie', name: 'Charlie', contributions: ['code']},
  {login: 'alice', name: 'Alice', contributions: ['code', 'doc', 'test']},
  {login: 'bob', name: 'Bob', contributions: ['design', 'doc']},
]

test('preserves original order when sorting is none or omitted', () => {
  const result = sortContributors(sampleContributors)
  expect(result.map(c => c.login)).toEqual(['charlie', 'alice', 'bob'])

  const resultNone = sortContributors(sampleContributors, {
    contributorsSortBy: 'none',
  })
  expect(resultNone.map(c => c.login)).toEqual(['charlie', 'alice', 'bob'])
})

test('sorts by name ascending', () => {
  const result = sortContributors(sampleContributors, {
    contributorsSortBy: 'name',
  })
  expect(result.map(c => c.login)).toEqual(['alice', 'bob', 'charlie'])
})

test('sorts by name descending with - prefix', () => {
  const result = sortContributors(sampleContributors, {
    contributorsSortBy: '-name',
  })
  expect(result.map(c => c.login)).toEqual(['charlie', 'bob', 'alice'])
})

test('sorts by name descending with contributorsSortOrder: desc', () => {
  const result = sortContributors(sampleContributors, {
    contributorsSortBy: 'name',
    contributorsSortOrder: 'desc',
  })
  expect(result.map(c => c.login)).toEqual(['charlie', 'bob', 'alice'])
})

test('supports contributorsSortAlphabetically backward compatibility', () => {
  const result = sortContributors(sampleContributors, {
    contributorsSortAlphabetically: true,
  })
  expect(result.map(c => c.login)).toEqual(['alice', 'bob', 'charlie'])
})

test('sorts by username (login) ascending and descending', () => {
  const contributors = [
    {login: 'zack', name: 'Aaron'},
    {login: 'aaron', name: 'Zack'},
    {login: 'mike', name: 'Mike'},
  ]

  const asc = sortContributors(contributors, {contributorsSortBy: 'username'})
  expect(asc.map(c => c.login)).toEqual(['aaron', 'mike', 'zack'])

  const desc = sortContributors(contributors, {
    contributorsSortBy: '-username',
  })
  expect(desc.map(c => c.login)).toEqual(['zack', 'mike', 'aaron'])
})

test('sorts by number of contributions descending', () => {
  const result = sortContributors(sampleContributors, {
    contributorsSortBy: '-contributions',
  })
  expect(result.map(c => c.login)).toEqual(['alice', 'bob', 'charlie'])
  expect(result[0].contributions).toHaveLength(3)
  expect(result[1].contributions).toHaveLength(2)
  expect(result[2].contributions).toHaveLength(1)
})

test('sorts by number of contributions ascending', () => {
  const result = sortContributors(sampleContributors, {
    contributorsSortBy: 'contributions',
  })
  expect(result.map(c => c.login)).toEqual(['charlie', 'bob', 'alice'])
})

test('handles case-insensitivity when sorting by string', () => {
  const contributors = [
    {login: 'b', name: 'bob'},
    {login: 'A', name: 'Alice'},
    {login: 'c', name: 'Charlie'},
  ]

  const result = sortContributors(contributors, {contributorsSortBy: 'name'})
  expect(result.map(c => c.name)).toEqual(['Alice', 'bob', 'Charlie'])
})

test('handles empty or non-array contributors gracefully', () => {
  expect(sortContributors([])).toEqual([])
  expect(sortContributors(null)).toEqual([])
  expect(sortContributors(undefined)).toEqual([])
})
