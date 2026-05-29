// ESLint config for @gestao-fretamento-pro/worker
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@gestao-fretamento-pro/eslint-config/nestjs'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
