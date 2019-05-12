import nock from 'nock'
import githubAPI from '../github'

import issuesResponse from './github/issues.response.json'

const check = githubAPI.getContributors

const owner = 'all-contributors'
const repo = 'all-contributors-bot'

const token = process.env.GITHUB_TOKEN

beforeAll(() => {
  nock.disableNetConnect()
  nock('https://api.github.com')
    .persist()
    .get(`/repos/${owner}/${repo}/issues?state=all`)
    .reply(200, issuesResponse)
})

afterAll(() => {
  nock.enableNetConnect()
})

test('gets contributors correctly', async () => {
  const expected = [
    {login: 'greenkeeper[bot]', types: ['bug', 'code']},
    {login: 'jakebolam', types: ['code', 'idea', 'bug']},
    {login: 'Berkmann18', types: ['code']},
    {login: 'K-Sato1995', types: ['bug']},
    {login: 'teamcoltra', types: ['bug']},
    {login: 'MatheusRV', types: ['bug']},
    {login: 'kaikai1024', types: ['idea']},
    {login: 'allcontributors[bot]', types: ['code']},
    {login: 'mralwin', types: ['code']},
    {login: 'kevinwolfcr', types: ['bug']},
  ]
  const actual = await check(
    'all-contributors',
    'all-contributors-bot',
    null,
    token,
  )
  expect(actual).toEqual(expected)
})
