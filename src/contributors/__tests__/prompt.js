import {test, expect} from 'vitest'
import prompt, {getQuestions} from '../prompt.js'

function fixtures() {
  const options = {
    repoType: 'github',
    contributors: [
      {
        login: 'jfmengels',
        name: 'Jeroen Engels',
        avatar_url: 'https://avatars.githubusercontent.com/u/3869412?v=3',
        profile: 'https://github.com/jfmengels',
        contributions: [],
      },
      {
        login: 'kentcdodds',
        name: 'Kent C. Dodds',
        avatar_url: 'https://avatars.githubusercontent.com/u/1500684?v=3',
        profile: 'http://kentcdodds.com/',
        contributions: [],
      },
      {
        login: 'jccguimaraes',
        name: 'João Guimarães',
        avatar_url: 'https://avatars.githubusercontent.com/u/14871650?v=3',
        profile: 'https://github.com/jccguimaraes',
        contributions: [],
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
    'invalidContributionType1,invalidContributionType2 is/are invalid contribution type(s)',
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
    expect(answers.contributions).toHaveLength(2)
    expect(answers.contributions).toEqual(['code', 'bug'])
  })
})

test(`should prompt for contributions when username is provided but contributions are undefined`, () => {
  const options = fixtures()
  const username = 'userName'
  const contributions = undefined

  const questions = getQuestions(options, username, contributions)
  const contributionsQuestion = questions.find(q => q.name === 'contributions')

  expect(contributionsQuestion).toBeDefined()
  expect(contributionsQuestion.message).toBe('What are the contribution types?')
})

test(`should return prompt with username message when username and contributions are not provided`, () => {
  const options = fixtures()
  const username = undefined
  const contributions = undefined
  const questions = getQuestions(options, username, contributions)
  const usernameQuestion = questions.find(q => q.name === 'username')
  expect(usernameQuestion).toBeDefined()
  expect(usernameQuestion.message).toBe(
    "Oops. Missing something. What is the contributor's GitHub username?",
  )
})

test(`username validation should return error when input is empty`, () => {
  const options = fixtures()
  const questions = getQuestions(options, undefined, undefined)
  const usernameQuestion = questions.find(q => q.name === 'username')

  const result = usernameQuestion.validate('')
  expect(result).toBe('Username not provided')
})

test(`username validation should return true when input is provided`, () => {
  const options = fixtures()
  const questions = getQuestions(options, undefined, undefined)
  const usernameQuestion = questions.find(q => q.name === 'username')

  const result = usernameQuestion.validate('lwasser')
  expect(result).toBe(true)
})

test(`contributions validation should return error when no contributions selected`, () => {
  const options = fixtures()
  const questions = getQuestions(options, 'userName', undefined)
  const contributionsQuestion = questions.find(q => q.name === 'contributions')

  // Simulate user selecting nothing (empty array)
  const result = contributionsQuestion.validate([], {username: 'userName'})
  expect(result).toBe('Use space to select at least one contribution type.')
})

test(`contributions validation should return error when selection matches previous contributions`, () => {
  const options = {
    repoType: 'github',
    contributors: [
      {
        login: 'jfmengels',
        name: 'Jeroen Engels',
        contributions: ['code', 'doc'], // Existing contributions
      },
    ],
  }

  const questions = getQuestions(options, 'jfmengels', undefined)
  const contributionsQuestion = questions.find(q => q.name === 'contributions')

  // The user's contrib types already existing in the all-contribs file
  const result = contributionsQuestion.validate(['code', 'doc'], {
    username: 'jfmengels',
  })
  expect(result).toBe(
    'Nothing changed, use space to select contribution types.',
  )
})

test(`contributions validation should return true when valid selection is made`, () => {
  const options = fixtures()
  const questions = getQuestions(options, 'userName', undefined)
  const contributionsQuestion = questions.find(q => q.name === 'contributions')

  // Simulate user selecting valid contributions
  const result = contributionsQuestion.validate(['code', 'doc'], {
    username: 'userName',
  })
  expect(result).toBe(true)
})
