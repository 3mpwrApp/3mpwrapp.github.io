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
      accessibilityState,
      hitSlop,
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
