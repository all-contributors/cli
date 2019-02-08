import addContributorWithDetails from '../addWithDetails'
import fixtures from './fixtures'

test('add new contributor without going to the network', async () => {
  const {options} = fixtures()
  const userDetails = {
    login: 'jakebolam',
    contributions: ['code', 'security'],
    name: 'Jake Bolam',
    avatar_url: 'my-avatar.example.com',
    profile: 'jakebolam.com',
  }

  const contributors = await addContributorWithDetails({
    options,
    login: userDetails.login,
    contributions: userDetails.contributions,
    name: userDetails.name,
    avatar_url: userDetails.avatar_url,
    profile: userDetails.profile,
  })

  expect(contributors).toHaveLength(options.contributors.length + 1)
  expect(contributors[options.contributors.length]).toEqual(userDetails)
})
