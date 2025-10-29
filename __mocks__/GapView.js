/**
 * Mock for GapView component used in tests
 * Supports both default and named exports: import GapView and import { GapView }
 */
const React = require('react');
const { View } = require('react-native');

// Mock GapView as a simple View wrapper that accepts gap props but renders as View
const GapView = (props) => {
  // Destructure gap props to avoid passing them to View (they're not valid View props)
  const { gap, rowGap, columnGap, children, ...viewProps } = props;
  return React.createElement(View, viewProps, children);
};

// Export both as named export and default export
exports.GapView = GapView;
exports.default = GapView;
module.exports = exports.default;
module.exports.GapView = GapView;
