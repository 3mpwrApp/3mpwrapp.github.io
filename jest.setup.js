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
    useColorScheme: () => 'light',
  };
  const StyleSheet = { create: (styles) => styles, hairlineWidth: 1 };
  const normalizeStyle = (style) => {
    try {
      if (typeof style === 'function') {
        // Call with a deterministic state for tests
        style = style({ pressed: false, hovered: false, focused: false });
      }
      const merge = (acc, part) => {
        if (!part) return acc;
        if (Array.isArray(part)) return part.reduce(merge, acc);
        if (typeof part === 'object') return Object.assign(acc, part);
        return acc;
      };
      if (Array.isArray(style)) return style.reduce(merge, {});
      if (style && typeof style === 'object') return style;
    } catch {}
    return undefined;
  };
  const stripProps = (props = {}) => {
    const {
      accessibilityRole,
      accessibilityLabel,
      accessibilityHint: _accessibilityHint,
      accessibilityLiveRegion: _accessibilityLiveRegion,
      accessibilityState,
      accessible: _accessible,
      accessibilityElementsHidden: _a11yHidden,
      accessibilityViewIsModal: _a11yModal,
      nativeID: _nativeID,
      importantForAccessibility: _ifa,
      testID,
      // interactivity
      onPress,
      onLongPress: _onLongPress,
      // RN-only or unsupported DOM props
      hitSlop: _hitSlop,
      collapsable: _collapsable,
      contentContainerStyle: _contentContainerStyle,
      // TextInput only
      placeholderTextColor: _placeholderTextColor,
      returnKeyType: _returnKeyType,
      secureTextEntry: _secureTextEntry,
      // Text only
      numberOfLines: _numberOfLines,
      // typography
      maxFontSizeMultiplier: _maxFontSizeMultiplier,
      // FlatList-only RN props we don't want on DOM
      ListEmptyComponent: _ListEmptyComponent,
      ListHeaderComponent: _ListHeaderComponent,
      ListFooterComponent: _ListFooterComponent,
      initialNumToRender: _initialNumToRender,
      refreshControl: _refreshControl,
      // Style-only RN props ignored in DOM
      onLayout: _onLayout,
      // Modal-only / RN-specific props
      animationType: _animationType,
      onRequestClose: _onRequestClose,
      presentationStyle: _presentationStyle,
      statusBarTranslucent: _statusBarTranslucent,
      transparent: _transparent,
      visible: _visible,
      // everything else
      ...rest
    } = props;
    // map a11y role
    let role;
    if (accessibilityRole === 'button') role = 'button';
    else if (accessibilityRole === 'link') role = 'link';
    else if (accessibilityRole === 'header') role = 'heading';
    // Build base out props
    const out = {
      ...rest,
      'aria-label': accessibilityLabel,
      role,
      onClick: onPress,
    };
    // Normalize RN style prop (arrays/functions) to a plain object for DOM
    if ('style' in out) {
      out.style = normalizeStyle(out.style);
      if (out.style === undefined) delete out.style;
    }
    // Map accessibilityState to ARIA
    if (accessibilityState) {
      if (typeof accessibilityState.checked !== 'undefined') out['aria-checked'] = accessibilityState.checked;
      if (typeof accessibilityState.disabled !== 'undefined') out['aria-disabled'] = accessibilityState.disabled;
      if (typeof accessibilityState.selected !== 'undefined') out['aria-selected'] = accessibilityState.selected;
      if (typeof accessibilityState.busy !== 'undefined') out['aria-busy'] = accessibilityState.busy;
      if (typeof accessibilityState.expanded !== 'undefined') out['aria-expanded'] = accessibilityState.expanded;
      if (typeof accessibilityState.readonly !== 'undefined') out['aria-readonly'] = accessibilityState.readonly;
    }
    if (testID) out['data-testid'] = testID;
    return out;
  };
  const View = (props) => React.createElement('div', stripProps(props), props.children);
  const ScrollView = (props) => React.createElement('div', stripProps(props), props.children);
  const Text = (props) => React.createElement('span', stripProps(props), props.children);
  const TextInput = (props) => {
    const { onChangeText, value, multiline, ...rest } = props;
    const tag = multiline ? 'textarea' : 'input';
    const handleChange = (e) => {
      if (onChangeText) onChangeText(e && e.target ? e.target.value : '');
    };
    return React.createElement(tag, { value, onChange: handleChange, ...stripProps(rest) }, props.children);
  };
  const Pressable = (props) => React.createElement('button', stripProps(props), props.children);
  // Basic Modal mock: render children in place, stripping RN-only props to avoid DOM warnings
  const Modal = ({ children, ...props }) => {
    // Reuse stripProps to drop animationType/onRequestClose/etc.
    const safe = stripProps(props);
    return React.createElement('div', safe, children);
  };
  // Basic Alert mock: capture calls for assertions
  const Alert = { alert: jest.fn(), prompt: jest.fn() };
  const AccessibilityInfo = { announceForAccessibility: jest.fn() };
  // Provide a simple Linking stub used by components and tests
  const Linking = {
    canOpenURL: jest.fn(async () => true),
    openURL: jest.fn(async () => true),
  };
  // Minimal FlatList mock: render items using renderItem
  const FlatList = ({ data = [], renderItem = () => null, keyExtractor, ListFooterComponent, ...rest }) => {
    const children = (data || []).map((item, index) => {
      const element = renderItem({ item, index });
      if (!element) return null;
      const key = keyExtractor ? keyExtractor(item, index) : index;
      return React.createElement(React.Fragment, { key }, element);
    });
    if (ListFooterComponent) {
      children.push(React.createElement(React.Fragment, { key: 'footer' },
        typeof ListFooterComponent === 'function' ? ListFooterComponent() : ListFooterComponent
      ));
    }
    return React.createElement('div', stripProps(rest), children);
  };
  // Minimal RefreshControl mock: ignore
  const RefreshControl = () => null;
  // Share mock to enable jest.spyOn(Share, 'share')
  const Share = { share: async () => ({}) };
  return { ...RN, StyleSheet, View, ScrollView, Text, TextInput, Pressable, FlatList, RefreshControl, Share, Modal, Alert, AccessibilityInfo, Linking };
});

// Alias fireEvent.press -> fireEvent.click for web-like test env
try {
  const rtl = require('@testing-library/react');
  if (rtl.fireEvent && !rtl.fireEvent.press) {
    rtl.fireEvent.press = rtl.fireEvent.click;
  }
} catch {}

// Note: Mapping of '@testing-library/react-native' to web variant is handled via moduleNameMapper in jest.config.js

// Provide a lightweight global mock for Expo vector icons to avoid native EventEmitter requirements
try {
  jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const Icon = (props) => React.createElement('span', props, null);
    // Return a proxy so any icon set access resolves to the mock Icon component
    return new Proxy({}, { get: () => Icon });
  });
} catch {}

// Mock react-native-safe-area-context to avoid native dependency in tests
try {
  jest.mock('react-native-safe-area-context', () => {
    return {
      useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
      SafeAreaProvider: ({ children }) => children,
      SafeAreaView: ({ children, ...rest }) => {
        const React = require('react');
        return React.createElement('div', rest, children);
      },
    };
  });
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
  /Warning: componentWillReceiveProps has been renamed/i,
  // Test-only analytics noise
  /analytics event \(noop native\)/i,
  /\[analytics\] Unused registry events/i,
  /screen_view \{/i
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
