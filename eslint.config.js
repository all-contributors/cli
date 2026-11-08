import js from '@eslint/js'
import markdown from '@eslint/markdown'
import jsonc from 'eslint-plugin-jsonc'
import {defineConfig, globalIgnores} from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import packageJson from 'eslint-plugin-package-json'
import vitestPlugin from 'eslint-plugin-vitest'
import yml from 'eslint-plugin-yml'
import globals from 'globals'

export default defineConfig([
  globalIgnores([
    'coverage/**',
    'dist/**',
    '.all-contributorsrc',
    'CHANGELOG*',
  ]),
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
      'import/no-named-as-default-member': 'off',
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
  {
    extends: [jsonc.configs['flat/recommended-with-json']],
    files: ['**/*.json'],
  },
  {
    extends: [packageJson.configs.recommended, packageJson.configs.stylistic],
    files: ['package.json'],
    rules: {
      // TODO: Tech debt that we'll want to address in the future.
      // https://github.com/all-contributors/cli/issues/606
      'package-json/require-exports': 'off',
    },
  },
  {
    extends: [markdown.configs.recommended],
    files: ['**/*.md'],
    rules: {
      // https://github.com/eslint/markdown/issues/294
      'markdown/no-missing-label-refs': 'off',
    },
  },
  {
    extends: [yml.configs['flat/standard'], yml.configs['flat/prettier']],
    files: ['**/*.{yml,yaml}'],
    rules: {
      'yml/file-extension': ['error', {extension: 'yml'}],
      'yml/sort-sequence-values': [
        'error',
        {order: {type: 'asc'}, pathPattern: '^.*$'},
      ],
    },
  },
])
