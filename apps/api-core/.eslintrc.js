// ESLint config for @gestao-fretamento-pro/api-core
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@gestao-fretamento-pro/eslint-config/nestjs'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  // Fora do tsconfig (importa o worker, fora do rootDir); compilado/rodado pelo
  // runner de integracao, nao pelo typed-eslint deste pacote.
  ignorePatterns: ['src/tests/fuel-features.integration-spec.ts'],
  rules: {
    // Allow any in NestJS metadata objects (decorators, DI tokens)
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
