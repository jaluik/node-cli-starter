const config = require('eslint-config-love');

module.exports = [
  {
    ...config,
    files: ['src/**/*.ts'],
    rules: {
      ...config.rules,
      '@typescript-eslint/strict-boolean-expressions': 0,
      '@typescript-eslint/prefer-nullish-coalescing': 0,
      '@typescript-eslint/prefer-nullish-coalescing': 0,
    },
  },
];
