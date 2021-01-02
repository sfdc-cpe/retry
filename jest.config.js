module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/",
    "coverage"
  ],
  testEnvironment: 'node',
  testMatch: [
    "**/__tests__/**/*.(spec|test).[t]s?(x)",
  ],
  transform: {
    '^.+\\.(ts|tsx)$': require.resolve('ts-jest')
  },
};
