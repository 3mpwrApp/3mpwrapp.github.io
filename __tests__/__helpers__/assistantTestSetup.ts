// Shared test setup for AssistantHub tests: mocks palette, typography, i18n, A11yPressable.

// Palette and typography hooks to avoid provider requirements
jest.mock('../../theme/usePalette', () => ({ useAppPalette: () => ({ background:'#fff', text:'#111', primary:'#06f', onPrimary:'#fff', muted:'#ccc', surface:'#f9f9f9', card:'#f5f5f5' }) }));
jest.mock('../../theme/typography', () => ({ useTextScale: () => ({ factor: 1 }) }));

// Minimal i18n mock: include passthrough I18nProvider for TestProviders compatibility
jest.mock('../../i18n', () => {
  const React = require('react');
  return {
    I18nProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useTranslation: () => ({ t: (k: string, def?: string) => def || k, lang: 'en' }),
  };
});

// Mock A11yPressable to a plain button
jest.mock('../../components/A11yPressable', () => {
  const React = require('react');
  return ({ children, onPress, accessibilityLabel }: any) => React.createElement('button', { onClick: onPress, 'aria-label': accessibilityLabel }, children);
});
