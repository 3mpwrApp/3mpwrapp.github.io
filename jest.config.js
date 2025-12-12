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
    '^expo-calendar$': '<rootDir>/__mocks__/expo-calendar.js',
    '^@sentry/react-native$': '<rootDir>/__mocks__/@sentry/react-native.js',
    // Map all useA11y imports to the mock file
    '^../hooks/useA11y$': '<rootDir>/__mocks__/useA11y.js',
    '^.*/hooks/useA11y$': '<rootDir>/__mocks__/useA11y.js',
    '^../../../hooks/useA11y$': '<rootDir>/__mocks__/useA11y.js',
    '^.*hooks/useA11y$': '<rootDir>/__mocks__/useA11y.js',
    // Map useColorScheme imports to the mock file
    '^../hooks/useColorScheme$': '<rootDir>/__mocks__/hooks/useColorScheme.js',
    '^.*/hooks/useColorScheme$': '<rootDir>/__mocks__/hooks/useColorScheme.js',
    '^../../../hooks/useColorScheme$': '<rootDir>/__mocks__/hooks/useColorScheme.js',
    // Map GapView to a mock
    '^../../../components/GapView$': '<rootDir>/__mocks__/GapView.js',
    '^.*/components/GapView$': '<rootDir>/__mocks__/GapView.js',
    // Map ResponsiveScreenWrapper to a mock
    '^../../../components/ResponsiveScreenWrapper$': '<rootDir>/__mocks__/ResponsiveScreenWrapper.js',
    '^.*/components/ResponsiveScreenWrapper$': '<rootDir>/__mocks__/ResponsiveScreenWrapper.js'
  },
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.tsx','**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['i18n/**/*.{ts,tsx}','scripts/i18n-*.js','services/notifications*.{ts,tsx}','store/notifications.{ts,tsx}','types/notifications.ts'],
  coverageThreshold: {
    global: {
      branches: 12,
      functions: 22,
      lines: 21,
      statements: 21,
    },
  },
  coveragePathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['<rootDir>/jest.setup.js']
};
