import js from '@eslint/js'
import {defineConfig, globalIgnores} from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import jestPlugin from 'eslint-plugin-jest'
import globals from 'globals'

export default defineConfig([
  globalIgnores(['coverage/**', 'dist/**', '_law_tests/**']),
  {linterOptions: {reportUnusedDisableDirectives: 'error'}},
  {
    extends: [js.configs.recommended, importPlugin.flatConfigs.recommended],
    files: ['**/*.{mjs,js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
    },
    rules: {
      'import/no-unresolved': ['error', {ignore: ['^eslint/', '^prettier$']}],
      'import/no-extraneous-dependencies': 'error',
      'import/default': 'off',
      'import/namespace': 'off',
    },
  },
  {
    extends: [jestPlugin.configs['flat/recommended']],
    files: ['**/__tests__/**/*.js'],
    languageOptions: {
      globals: globals.jest,
    },
    rules: {
      'jest/no-disabled-tests': 'error',
      'jest/prefer-to-have-length': 'error',
    },
  },
])
