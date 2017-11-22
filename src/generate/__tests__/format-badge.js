import _ from 'lodash/fp'
import formatBadge from '../format-badge'

test('return badge with the number of contributors', () => {
  const options = {}
  const expected8 =
    '[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors)'
  const expected16 =
    '[![All Contributors](https://img.shields.io/badge/all_contributors-16-orange.svg?style=flat-square)](#contributors)'

  expect(formatBadge(options, _.times(_.constant({}), 8))).toBe(expected8)
  expect(formatBadge(options, _.times(_.constant({}), 16))).toBe(expected16)
})

test('be able to specify custom badge template', () => {
  const options = {
    badgeTemplate: 'We have <%= contributors.length %> contributors',
  }

  expect(formatBadge(options, _.times(_.constant({}), 8))).toBe(
    'We have 8 contributors',
  )
  expect(formatBadge(options, _.times(_.constant({}), 16))).toBe(
    'We have 16 contributors',
  )
})
