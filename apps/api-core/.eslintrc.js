// ESLint config for @gestao-fretamento-pro/api-core
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@gestao-fretamento-pro/eslint-config/nestjs'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Allow any in NestJS metadata objects (decorators, DI tokens)
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
