import {test, expect, describe} from 'vitest'
import {addBadge, addContributorsList} from '../init-content.js'

describe('addBadge', () => {
  test('insert badge under title', () => {
    const content = ['# project', '', 'Description', '', 'Foo bar'].join('\n')
    const expected = [
      '# project',
      '<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->',
      '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)',
      '<!-- ALL-CONTRIBUTORS-BADGE:END -->',
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
      '<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->',
      '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)',
      '<!-- ALL-CONTRIBUTORS-BADGE:END -->',
    ].join('\n')

    const result = addBadge(content)

    expect(result).toBe(expected)
  })
})

describe('addContributorsList', () => {
  test('insert list under contributors section', () => {
    const content = [
      '# project',
      '',
      'Description',
      '',
      '## Contributors',
      '',
    ].join('\n')
    const result = addContributorsList(content)

    expect(result).toMatchSnapshot()
  })

  test('create contributors section if it is absent', () => {
    const content = ['# project', '', 'Description'].join('\n')
    const result = addContributorsList(content)

    expect(result).toMatchSnapshot()
  })

  test('create contributors section if content is empty', () => {
    const content = ''
    const result = addContributorsList(content)

    expect(result).toMatchSnapshot()
  })
})
