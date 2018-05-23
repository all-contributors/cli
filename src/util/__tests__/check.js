import check from '../check'

test('Should throw error is no owner or name is present', () => {
  expect(() => check('', 'cleave-markdown')).toThrow(
    'Error! Project owner is not set in .all-contributorsrc',
  )
  expect(() => check('M-ZubairAhmed', '')).toThrow(
    'Error! Project name is not set in .all-contributorsrc',
  )
})
