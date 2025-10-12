/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  // Increase default timeout to reduce flakiness on slower CI/Windows runners
  testTimeout: 30000,
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  // Ensure React Native / Expo packages are transformed instead of ignored (they ship untranspiled ESM)
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation/.*|@react-native-async-storage/async-storage|expo|expo-.*|@expo/.*|@unimodules/.*|unimodules-.*|sentry-expo)/)'
  ],
  moduleFileExtensions: ['ts','tsx','js','jsx','json'],
  moduleNameMapper: {
    '^@testing-library/react-native$': '@testing-library/react',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/expo-vector-icons.js',
    '^expo-router$': '<rootDir>/__mocks__/expo-router.js',
    '^../hooks/useA11y$': '<rootDir>/__mocks__/useA11y.js'
  },
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.tsx','**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['i18n/**/*.{ts,tsx}','scripts/i18n-*.js','services/notifications*.{ts,tsx}','store/notifications.{ts,tsx}','types/notifications.ts'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coveragePathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['<rootDir>/jest.setup.js']
};
