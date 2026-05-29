// Set dummy environment variables to satisfy validation during bootstrap
process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'dummy-secret-must-be-at-least-32-chars-long';
process.env.JWT_REFRESH_SECRET = 'dummy-refresh-secret-must-be-at-least-32-chars-long';
process.env.APP_URL = 'http://localhost:3000';
process.env.CORS_ORIGINS = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.integration-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};

