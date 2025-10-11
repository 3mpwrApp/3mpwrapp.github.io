const React = require('react');

// Simple router object with jest.fn methods we can assert against in tests
const router = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  navigate: jest.fn(),
};

function normalizeHref(href) {
  if (!href) return undefined;
  if (typeof href === 'string') return { pathname: href };
  if (typeof href === 'object') return { pathname: href.pathname || '/', params: href.params };
  return undefined;
}

// Link mock that wires child onPress to router.push for asChild usage
const Link = ({ children, href, asChild }) => {
  const target = normalizeHref(href);
  if (asChild && React.isValidElement(children)) {
    const child = React.Children.only(children);
    const origOnPress = child.props.onPress;
    const onPress = (...args) => {
      if (target) router.push(target);
      if (typeof origOnPress === 'function') origOnPress(...args);
    };
    return React.cloneElement(child, { onPress });
  }
  // Non-asChild: render a span that navigates on click
  return React.createElement(
    'span',
    { onClick: () => target && router.push(target), 'data-href': target?.pathname, role: 'link' },
    children
  );
};

function useRouter() { return router; }
function useLocalSearchParams() { return {}; }
function usePathname() { return '/'; }

module.exports = { Link, router, useRouter, useLocalSearchParams, usePathname };
