import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'eqeqeq': 'error',          // ошибка при использовании == вместо ===
      'semi': ['error', 'always'], // Требовать точку с запятой в конце выражений
      'quotes': ['error', 'single'], // Требовать одинарные кавычки
    },
  },
];
