module.exports = {
  extends: 'standard',
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 6
  },
  globals: {
    chrome: true
  },
  rules: {
    "semi": ["error", "always"],
    "space-before-function-paren": ["error", "never"],
  }

};
