import {unlink} from 'fs'
import {addContributorsList} from '../init-content'
import ensureFileExists from '../file-exist'

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

test('README exists', done => {
  const file = 'README.md'
  ensureFileExists(file)
    .then(data => expect(data).toStrictEqual(file))
    .then(_ => done())
})

test("LOREM doesn't exists", done => {
  const file = 'LOREM.md'
  ensureFileExists(file).then(data => {
    expect(data).toStrictEqual(file)
    return unlink(file, err => {
      if (err) throw err
      done()
    })
  })
})
