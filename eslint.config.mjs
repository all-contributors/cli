import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import jestPlugin from 'eslint-plugin-jest'
import globals from 'globals'

export default [
  // Base config
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/ignore': ['node_modules', '.json$', '.(scss|less|css|styl)$'],
    },
    rules: {
      // Custom overrides (from package.json eslintConfig)
      camelcase: 'off',
      'no-process-exit': 'off',
      'import/extensions': 'off',
      'func-names': 'off',
      'consistent-return': 'off',

      // Additional useful rules (not in recommended)
      'array-callback-return': 'error',
      'block-scoped-var': 'error',
      'default-case': 'error',
      'dot-notation': 'error',
      'guard-for-in': 'error',
      'no-alert': 'error',
      'no-array-constructor': 'error',
      'no-await-in-loop': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-implied-eval': 'error',
      'no-iterator': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-loop-func': 'error',
      'no-multi-assign': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-octal-escape': 'error',
      'no-proto': 'error',
      'no-return-assign': 'error',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-shadow': 'error',
      'no-throw-literal': 'error',
      'no-undef-init': 'error',
      'no-unused-expressions': 'off',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-void': 'off',
      'no-warning-comments': ['error', {location: 'anywhere', terms: ['fixme']}],
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      radix: 'error',
      'require-yield': 'error',
      yoda: 'error',

      // Import plugin rules (beyond recommended)
      'import/no-duplicates': 'error',
      'import/no-extraneous-dependencies': 'error',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            ['external', 'internal'],
            'parent',
            ['sibling', 'index'],
          ],
        },
      ],
    },
  },
  // Jest test files
  {
    files: [
      '**/__tests__/**/*.+(js|ts)?(x)',
      '**/*.{spec,test}.+(js|ts)?(x)',
    ],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      // Keep important jest rules
      'jest/no-focused-tests': 'error',
      'jest/no-disabled-tests': 'warn',
      'jest/prefer-to-have-length': 'warn',
    },
  },
  // Ignore patterns
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'eslint.config.mjs'],
  },
]
