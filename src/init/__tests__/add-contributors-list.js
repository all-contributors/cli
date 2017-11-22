import {addContributorsList} from '../init-content'

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
