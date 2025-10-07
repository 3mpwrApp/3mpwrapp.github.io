const React = require('react');
const Icon = (props) => React.createElement('span', props, null);
// Emulate module shape where sets are named exports
module.exports = new Proxy({}, { get: () => Icon });
