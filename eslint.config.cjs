const globals = require('globals');
const recommended = require('@eslint/js').configs.recommended;

module.exports = [
  {
    ignores: [
      'coverage/**',
      'dist/**',
      'test/index.bundle.js',
      'test/index.mjs',
      'test/mocha.css',
    ],
  },
  {
    ...recommended,
    languageOptions: {
      ecmaVersion: 2019,
      sourceType: 'module',
      globals: {
        ...globals.es6,
        ...globals.node,
      },
    },
  },
  {
    files: ['test/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
];
