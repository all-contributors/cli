const jestConfig = require('kcd-scripts/jest')

module.exports = Object.assign(jestConfig, {
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 40,
      lines: 50,
      statements: 50,
    },
  },
  forceExit: true,
})
