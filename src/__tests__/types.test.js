import {test, expect} from 'vitest'
import * as api from '../api.js'

test('exports expected API functions matching type declarations', () => {
  expect(typeof api.addContributorWithDetails).toBe('function')
  expect(typeof api.generate).toBe('function')
  expect(typeof api.initContributorsList).toBe('function')
  expect(typeof api.initBadge).toBe('function')
})
