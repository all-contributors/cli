import {test, expect} from 'vitest'
import {formatBadge} from '../format-badge.js'

test('return badge with the number of contributors', () => {
  const options = {}
  const expected8 =
    '[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors-)'
  const expected16 =
    '[![All Contributors](https://img.shields.io/badge/all_contributors-16-orange.svg?style=flat-square)](#contributors-)'

  expect(formatBadge(options, Array(8).fill({}))).toBe(expected8)
  expect(formatBadge(options, Array(16).fill({}))).toBe(expected16)
})

test('be able to specify custom badge template', () => {
  const options = {
    badgeTemplate: 'We have <%= contributors.length %> contributors',
  }

  expect(formatBadge(options, Array(8).fill({}))).toBe('We have 8 contributors')
  expect(formatBadge(options, Array(16).fill({}))).toBe(
    'We have 16 contributors',
  )
})
