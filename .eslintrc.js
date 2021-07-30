module.exports = {
  root: true,
  parserOptions: {
    project: './tsconfig.lint.json',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
