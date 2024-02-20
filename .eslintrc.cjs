module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
  },
  extends: 'eslint:recommended',
  overrides: [
    {
      files: 'test/*.js',
      env: {
        mocha: true,
      },
    },
  ],
};
