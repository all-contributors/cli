import {test, expect, describe} from 'vitest'
import {unlink} from 'fs/promises'
import {addContributorsList} from '../init-content.js'
import {ensureFileExists} from '../file-exist.js'

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

describe('ensureFileExists', () => {
  test('README exists', async () => {
    const file = 'README.md'
    const data = await ensureFileExists(file)

    expect(data).toStrictEqual(file)
  })

  test("LOREM doesn't exists", async () => {
    const file = 'LOREM.md'
    const data = await ensureFileExists(file)

    expect(data).toStrictEqual(file)

    await unlink(file)
  })
})
