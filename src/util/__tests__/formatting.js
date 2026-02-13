import {test, expect} from 'vitest'
import path from 'path'
import {formatConfig} from '../formatting.js'

const content = {contributors: [{id: 'abc123'}]}

const absentFile = '/!@#*&^DefinitelyDoesNotExistAllContributorsCLI$!@#'
const absentConfigFileExpected = `{
  "contributors": [
    {
      "id": "abc123"
    }
  ]
}`

const presentFile = path.join(__dirname, '__stubs__', 'file.json')
const presentConfigFileExpected = `{
	"contributors": [
		{
			"id": "abc123"
		}
	]
}`

test('falls back to JSON.stringify when the configPath cannot resolve to a config', async () => {
  const output = await formatConfig(absentFile, content)

  expect(output).toBe(absentConfigFileExpected)
})

test('uses Prettier when the configPath can resolve to a config', async () => {
  const output = await formatConfig(presentFile, content)

  expect(output).toBe(presentConfigFileExpected)
})
