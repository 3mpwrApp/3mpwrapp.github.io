const React = require('react');

const Link = ({ children, onPress, href, asChild }) => {
  // Render a simple span/button-like element; invoke onPress when clicked
  return React.createElement('span', { onClick: onPress, 'data-href': href, 'data-as-child': !!asChild }, children);
};

const router = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  navigate: jest.fn(),
};

function useLocalSearchParams() { return {}; }
function usePathname() { return '/'; }

module.exports = { Link, router, useLocalSearchParams, usePathname };
