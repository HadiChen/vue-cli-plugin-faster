module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module'
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
