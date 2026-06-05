'use strict';
module.exports = {
  testEnvironment: '<rootDir>/__tests__/helpers/jestEnv.js',
  // Only *.test.js are suites — helpers/ are support files, not tests.
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
  setupFiles: ['<rootDir>/__tests__/helpers/setup.js'],
  // Drive the real routes but swap the Prisma client for the in-memory mock.
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/__tests__/helpers/prismaMock.js',
  },
  // The legacy standalone scripts aren't Jest tests.
  testPathIgnorePatterns: ['/node_modules/', 'test-v2.js', 'test-fixes.js'],
  clearMocks: true,
};
