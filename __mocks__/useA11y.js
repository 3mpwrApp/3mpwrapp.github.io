// Mock for hooks/useA11y
const useScreenReaderEnabled = jest.fn(() => false);
const useReduceMotionEnabled = jest.fn(() => false);
const useAnnounceOnMount = jest.fn();
const useFocusOnRefOnMount = jest.fn();
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
  useA11yAnnounce,
  MAX_FONT_SCALE: 2.0,
  MAX_CONTRAST_RATIO: 21.0,
};