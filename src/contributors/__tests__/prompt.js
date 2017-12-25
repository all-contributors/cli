import prompt from '../prompt'

function fixtures() {
  const options = {
    contributors: [
      {
        login: 'jfmengels',
        name: 'Jeroen Engels',
        avatar_url: 'https://avatars.githubusercontent.com/u/3869412?v=3',
        profile: 'https://github.com/jfmengels',
        contributions: [Array],
      },
      {
        login: 'kentcdodds',
        name: 'Kent C. Dodds',
        avatar_url: 'https://avatars.githubusercontent.com/u/1500684?v=3',
        profile: 'http://kentcdodds.com/',
        contributions: [Array],
      },
      {
        login: 'jccguimaraes',
        name: 'João Guimarães',
        avatar_url: 'https://avatars.githubusercontent.com/u/14871650?v=3',
        profile: 'https://github.com/jccguimaraes',
        contributions: [Array],
      },
    ],
  }
  return options
}

test(`should throw error if all contribution types are invalid`, () => {
  const options = fixtures()
  const username = 'userName'
  const contributions = 'invalidContributionType1,invalidContributionType2'
  expect(() => prompt(options, username, contributions)).toThrow(
    'Invalid contribution type/s entered',
  )
})

test(`should not throw error if atleast one of the contribution types is valid`, () => {
  const options = fixtures()
  const username = 'userName'
  const contributions = 'wrongContributionType,code'
  return prompt(options, username, contributions).then(answers => {
    expect(answers).toEqual({username: 'userName', contributions: ['code']})
  })
})

test(`should filter valid contribution types from user inserted types`, () => {
  const options = fixtures()
  const username = 'userName'
  const contributions =
    'invalidContributionType1,code,invalidContributionType2,bug'
  return prompt(options, username, contributions).then(answers => {
    expect(answers.contributions.length).toBe(2)
    expect(answers.contributions).toEqual(['code', 'bug'])
  })
})

test(`should throw error if no contribution types were included in add command`, () => {
  const options = fixtures()
  const username = 'userName'
  const contributions = ''
  expect(() => prompt(options, username, contributions)).toThrow(
    `No contribution type found in the input. Did you forget to include them in the add command?`,
  )
})
