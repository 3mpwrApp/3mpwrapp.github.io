// Mock for hooks/useA11y
const useScreenReaderEnabled = jest.fn(() => false);
const useReduceMotionEnabled = jest.fn(() => false);
const useAnnounceOnMount = jest.fn();
const useFocusOnRefOnMount = jest.fn();
const useAnnounceOnChange = jest.fn();
const useAccessibilityFontScale = jest.fn(() => 1.0);
const useFocusRestore = jest.fn(() => ({ restoreFocus: jest.fn() }));
const useLiveRegion = jest.fn();
const useA11yAnnounce = jest.fn(() => ({
  announce: jest.fn(),
  announceNow: jest.fn(),
  flushAnnouncements: jest.fn(),
}));

// Export as both named exports and default exports for compatibility
module.exports = {
  useScreenReaderEnabled,
  useReduceMotionEnabled,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
  useAnnounceOnChange,
  useAccessibilityFontScale,
  useFocusRestore,
  useLiveRegion,
  useA11yAnnounce,
  MAX_FONT_SCALE: 2.0,
  MAX_CONTRAST_RATIO: 21.0,
};

// Also export as default for ESM compatibility
module.exports.default = module.exports;
