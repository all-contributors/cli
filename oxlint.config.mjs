import {defineConfig} from 'oxlint'

export default defineConfig({
  plugins: ['import', 'vitest'],
  env: {node: true, es2025: true},
  categories: {correctness: 'error'},
  rules: {
    'no-undef': 'error',
    'no-case-declarations': 'error',
    'no-empty': 'error',
    'no-fallthrough': 'error',
    'no-prototype-builtins': 'error',
    'no-redeclare': 'error',
    'no-regex-spaces': 'error',
    'no-unexpected-multiline': 'error',
    'no-useless-backreference': 'error',
    'require-yield': 'error',
    'import/named': 'error',
    'import/export': 'error',
    'import/no-duplicates': 'error',
    'vitest/prefer-to-have-length': 'error',
    'vitest/no-commented-out-tests': 'error',
    'vitest/no-identical-title': 'error',
  },
  ignorePatterns: ['coverage/**', 'dist/**', 'CHANGELOG*'],
})
