module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 11,
  },
  env: {
    commonjs: true,
    node: true,
    es6: true,
  },
}
