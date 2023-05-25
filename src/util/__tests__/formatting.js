import path from 'path'
import formatting from '../formatting'

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
}
`

test('falls back to JSON.stringify when the configPath cannot resolve to a config', () => {
  expect(formatting.formatConfig(absentFile, content)).toBe(
    absentConfigFileExpected,
  )
})

test('uses Prettier when the configPath can resolve to a config', () => {
  expect(formatting.formatConfig(presentFile, content)).toBe(
    presentConfigFileExpected,
  )
})
