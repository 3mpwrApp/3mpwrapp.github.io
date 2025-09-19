/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleFileExtensions: ['ts','tsx','js','jsx','json'],
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  collectCoverageFrom: ['i18n/**/*.{ts,tsx}','scripts/i18n-*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
