/**
 * Mock for ResponsiveScreenWrapper component used in tests
 * Supports both default and named exports
 */
const React = require('react');
const { View } = require('react-native');

// Mock ResponsiveScreenWrapper as a simple View wrapper
const ResponsiveScreenWrapper = (props) => {
  // Destructure specific props to avoid passing them to View
  const { scrollable: _scrollable, keyboardBehavior: _keyboardBehavior, children, ...viewProps } = props;
  return React.createElement(View, viewProps, children);
};

// Export as default export
module.exports = ResponsiveScreenWrapper;