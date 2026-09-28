# Spec: Fix GitHub API Host Normalization and Non-JSON Response Handling

## Context & Motivation

Issue:
[all-contributors/cli#374](https://github.com/all-contributors/cli/issues/374)  
Reported error:

```
FetchError: invalid json response body at https://github.com/api/v3/users/zezhishao reason: Unexpected token 'N', "Not Found" is not valid JSON
```

### Root Cause Analysis

1. **GitHub API Host Resolution**: In `src/repo/github.js`:
   ```javascript
   function getApiHost(hostname) {
     if (!hostname) {
       hostname = 'https://github.com'
     }
     if (hostname !== 'https://github.com') {
       // Assume Github Enterprise
       return url.resolve(hostname, '/api/v3')
     }
     return hostname.replace(/:\/\//, '://api.')
   }
   ```
   If a repository's `.all-contributorsrc` contains a trailing slash in
   `repoHost` (e.g., `"repoHost": "https://github.com/"`), or uses HTTP
   (`"http://github.com"`), or points directly to `"https://api.github.com"`,
   the condition `hostname !== 'https://github.com'` evaluates to `true`.
   Consequently, it incorrectly assumes the host is GitHub Enterprise and
   generates `https://github.com/api/v3/users/...`. On public GitHub
   (`github.com`), `/api/v3` does not exist and returns a 404 text/HTML response
   `"Not Found"`.
2. **Uncaught JSON Parsing of Error Bodies**: In `getUserInfo` and
   `getContributorsPage`, `res.json()` is invoked unconditionally before
   verifying HTTP status codes or inspecting content types. When a server
   responds with 404, 502, or plain text, `res.json()` throws an unhandled
   `FetchError` (`Unexpected token 'N', "Not Found" is not valid JSON`) rather
   than a clear domain error.

## Solution

### 1. Normalize Hostnames in `getApiHost`

- Trim whitespace and remove trailing slashes.
- Check if normalized host is `https://github.com`, `http://github.com`,
  `https://api.github.com`, or `http://api.github.com` and return
  `https://api.github.com`.
- For enterprise hosts, normalize trailing slash to ensure clean resolution with
  `url.resolve`.

### 2. Guard HTTP Status and JSON Parsing

- In `getUserInfo`:
  - Check `res.status === 404` and throw
    `The username ${username} doesn't exist on GitHub.`.
  - Check `res.status === 401` and throw
    `Missing authentication for GitHub API. Did you set PRIVATE_TOKEN?`.
  - Wrap `res.json()` in a `try...catch` block to handle HTML/text error pages
    gracefully with a clear error message.
- In `getContributorsPage`:
  - Wrap `res.json()` in a `try...catch` block.

## Verification Plan

1. Unit tests in `src/repo/__tests__/github.js`:
   - Test `getApiHost` with `https://github.com/`, `http://github.com/`,
     `https://api.github.com/`.
   - Test `getUserInfo` with trailing slash `repoHost` against
     `https://api.github.com`.
   - Test handling of non-JSON responses.
2. Full test suite verification with `npm test -- --run`.
3. Lint and code formatting verification with `npm run lint`.
