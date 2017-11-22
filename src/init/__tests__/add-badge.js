import {addBadge} from '../init-content'

test('insert badge under title', () => {
  const content = ['# project', '', 'Description', '', 'Foo bar'].join('\n')
  const expected = [
    '# project',
    '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors)',
    '',
    'Description',
    '',
    'Foo bar',
  ].join('\n')

  const result = addBadge(content)

  expect(result).toBe(expected)
})

test('add badge if content is empty', () => {
  const content = ''
  const expected = [
    '',
    '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors)',
  ].join('\n')

  const result = addBadge(content)

  expect(result).toBe(expected)
})
