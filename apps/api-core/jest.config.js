/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@gestao-fretamento-pro/types$': '<rootDir>/../../packages/types/src/index.ts',
    '^@gestao-fretamento-pro/auth$': '<rootDir>/../../packages/auth/src/index.ts',
    '^@gestao-fretamento-pro/config$': '<rootDir>/../../packages/config/src/index.ts',
    '^@gestao-fretamento-pro/validators$': '<rootDir>/../../packages/validators/src/index.ts',
    '^@gestao-fretamento-pro/database$': '<rootDir>/../../packages/database/src/index.ts',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },
};
