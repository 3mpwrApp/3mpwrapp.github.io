// Basic globals expected by react-native / metro environment
if (typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = true;
}

// Minimal react-native mocks needed for i18n tests (avoid native bridge access)
jest.mock('react-native', () => ({
  I18nManager: { isRTL: false, forceRTL: () => {}, allowRTL: () => {} },
}));
