/* eslint-env jest */
// Basic globals expected by react-native / metro environment
if (typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = true;
}

// Minimal react-native mocks needed for i18n tests (avoid native bridge access)
jest.mock('react-native', () => {
  const React = require('react');
  const RN = {
    I18nManager: { isRTL: false, forceRTL: () => {}, allowRTL: () => {} },
    Platform: { OS: 'web', select: (o) => o.web },
  };
  const stripProps = (props) => {
    const {
      accessibilityRole,
      accessibilityLabel,
      accessibilityState, // remove from DOM
      hitSlop, // remove from DOM
      onPress,
      ...rest
    } = props;
    return { ...rest, 'aria-label': accessibilityLabel, role: accessibilityRole === 'button' ? 'button' : undefined, onClick: onPress };
  };
  const View = (props) => React.createElement('div', props, props.children);
  const Text = (props) => React.createElement('span', props, props.children);
  const Pressable = (props) => React.createElement('button', stripProps(props), props.children);
  return { ...RN, View, Text, Pressable };
});

// Alias fireEvent.press -> fireEvent.click for web-like test env
try {
  const rtl = require('@testing-library/react');
  if (rtl.fireEvent && !rtl.fireEvent.press) {
    rtl.fireEvent.press = rtl.fireEvent.click;
  }
} catch {}

// Suppress known noisy React Native / Expo warnings that add no test value
const originalWarn = console.warn;
const originalError = console.error;
const NOISY_WARN_PATTERNS = [
  /Animated: `useNativeDriver` was not specified/i,
  /Remote debugger is in a background tab/i,
  /Require cycle:/i,
  /deprecated prop type/i,
  /Non-serializable values were found in the navigation state/i,
  /RCTBridge required dispatch_sync to load/i,
  /ViewPropTypes will be removed/i,
  /Can't perform a React state update on an unmounted component/i,
  /AsyncStorage has been extracted from react-native core/i,
  /Warning: componentWillReceiveProps has been renamed/i
];
function shouldFilter(message, args){
  if (typeof message === 'string') {
    return NOISY_WARN_PATTERNS.some(r=> r.test(message));
  }
  if (args && args.length && typeof args[0] === 'string') {
    return NOISY_WARN_PATTERNS.some(r=> r.test(args[0]));
  }
  return false;
}
console.warn = function(...args){
  if (shouldFilter(args[0], args)) return; // swallow
  return originalWarn.apply(this,args);
};
console.error = function(...args){
  // Keep console.error strict: only filter the exact duplicate patterns when they originate as warnings mis-routed.
  if (shouldFilter(args[0], args)) return;
  return originalError.apply(this,args);
};
