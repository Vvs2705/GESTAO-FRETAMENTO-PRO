// @gestao-fretamento-pro/eslint-config — NestJS-specific rules
// Extends the base config with NestJS/decorator-aware overrides

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./index.js'],
  parserOptions: {
    project: true,
  },
  rules: {
    // NestJS decorators use class syntax and metadata — relax some rules
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // NestJS injects constructors that may appear unused
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        // Allow unused constructor parameters (injected services)
        args: 'after-used',
      },
    ],

    // NestJS uses empty constructors and abstract classes
    '@typescript-eslint/no-empty-function': [
      'warn',
      { allow: ['constructors', 'arrowFunctions'] },
    ],

    // NestJS decorators like @Roles() accept any[] arguments
    '@typescript-eslint/no-unsafe-argument': 'warn',

    // Allow require() in module configs (e.g. ConfigModule.forRoot)
    '@typescript-eslint/no-var-requires': 'warn',

    // Prisma and NestJS use class instances with uninitialized fields (! operator)
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Allow void return types in event handlers and lifecycle hooks
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],

    // NestJS guards, interceptors and filters often use untyped req/res
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',

    // Allow console.log in development contexts (NestJS Logger is preferred)
    'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],

    // class-transformer uses property decorators that look unused
    '@typescript-eslint/no-unsafe-call': 'warn',
  },
};
