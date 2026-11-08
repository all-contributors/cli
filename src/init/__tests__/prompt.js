import inquirer from 'inquirer'
import {expect, test} from 'vitest'

import {questions} from '../prompt.js'

test('uses only prompt types registered by inquirer', () => {
  const registered = Object.keys(inquirer.prompt.prompts)
  const unknown = questions
    .map(question => question.type)
    .filter(type => type !== undefined && !registered.includes(type))
  expect(unknown).toEqual([])
})
