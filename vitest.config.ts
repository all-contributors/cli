import {defineConfig} from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      'lodash/fp': 'lodash/fp.js',
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'html', 'text'],
      thresholds: {
        branches: 50,
        functions: 40,
        lines: 50,
        statements: 50,
      },
    },
    environment: 'node',
    exclude: ['src/**/__tests__/fixtures/**'],
    globals: false,
    include: ['src/**/__tests__/**/*.js'],
  },
})
