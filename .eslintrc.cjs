module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: ['dist', 'dev-dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'import'],
  rules: {
    'react-hooks/exhaustive-deps': 'off',

    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    'import/no-unresolved': 'error',
    'import/no-relative-packages': 'error',
    'import/no-self-import': 'error',
    'import/newline-after-import': ['error', { count: 1, exactCount: true, considerComments: true }],
    'import/no-duplicates': 'error',

    'no-restricted-imports': 'off',
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../*'],
            message: 'No relative imports, please start with ~ instead',
          },
          {
            group: ['./*'],
            message: 'No relative imports, please start with ~ instead',
          },
        ],
      },
    ],

    // https://stackoverflow.com/a/64067915
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ]
  },

  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
}
