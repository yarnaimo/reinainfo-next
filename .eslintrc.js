/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
  extends: ['@yarnaimo'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          // 'firebase',
          // 'remeda',
          // 'runtypes',
          'dayjs',
        ],
        patterns: ['**/__mocks__/**'],
      },
    ],
  },
}

module.exports = config
