import js from '@eslint/js'
import {defineConfig, globalIgnores} from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import vitestPlugin from 'eslint-plugin-vitest'
import globals from 'globals'

export default defineConfig([
  globalIgnores(['coverage/**', 'dist/**']),
  {linterOptions: {reportUnusedDisableDirectives: 'error'}},
  {
    extends: [js.configs.recommended, importPlugin.flatConfigs.recommended],
    files: ['**/*.{mjs,js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
    },
    rules: {
      'import/no-unresolved': [
        'error',
        {ignore: ['^eslint/', '^prettier$', '^yargs']},
      ],
      'import/no-extraneous-dependencies': 'error',
      'import/default': 'off',
      'import/namespace': 'off',
    },
  },
  {
    extends: [vitestPlugin.configs.recommended],
    files: ['**/__tests__/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'vitest/prefer-to-have-length': 'error',
    },
  },
])
