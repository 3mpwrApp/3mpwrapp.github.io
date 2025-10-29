/**
 * Mock for GapView component used in tests
 */
const React = require('react');
const { View } = require('react-native');

// Mock GapView as a simple View wrapper
const GapView = (props) => {
  return React.createElement(View, props, props.children);
};

module.exports = { GapView, default: GapView };
