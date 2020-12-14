import url from '../url';

test(`Result of protocol validation should be true`, () => {
    expect(url.isHttpProtocol('http:')).toBe(true)
    expect(url.isHttpProtocol('https:')).toBe(true)
})

test(`Result of protocol validation should be false`, () => {
    expect(url.isHttpProtocol('ftp:')).toBe(false)
})

test(`Result of url validation should be true`, () => {
    expect(url.isValidHttpUrl('https://api.github.com/users/octocat')).toBe(true)
})

test(`Result of url validation should be false when url uses wrong protocol`, () => {
    expect(url.isValidHttpUrl('git://git@github.com:all-contributors/all-contributors-cli.git')).toBe(false)
})

test(`Result of url validation should be false when input isn't url`, () => {
    expect(url.isValidHttpUrl('github-octocat')).toBe(false)
})

test(`Result of parsed url should be equal`, () => {
    const input = 'https://api.github.com/users/octocat'
    const expected = 'https://api.github.com/users/octocat'
    expect(url.parseHttpUrl(input)).toBe(expected)
})

test(`Result of parsed url without protocol should be equal`, () => {
    const input = 'example.com'
    const expected = 'http://example.com/'
    expect(url.parseHttpUrl(input)).toBe(expected)
})

test(`Throw an error when parsed input isn't a string`, () => {
    const input = 123
    expect(url.parseHttpUrl.bind(null, input)).toThrowError('input must be a string')
})

test(`Throw an error when parsed url has wrong protocol`, () => {
    const input = 'ftp://domain.xyz'
    expect(url.parseHttpUrl.bind(null, input)).toThrowError('Provided URL has an invalid protocol')
})

test(`Throw an error when parsed input isn't a URL`, () => {
    const input = 'some string'
    expect(url.parseHttpUrl.bind(null, input)).toThrowError('Invalid URL: http://some string')
})
