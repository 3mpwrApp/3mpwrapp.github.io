// Mocks for expo-router and RN
const pushMock = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Link: ({ children, href }: any) => {
      const child = React.Children.only(children);
      const onPress = () => pushMock({ pathname: typeof href === 'string' ? href : href?.pathname });
      return React.cloneElement(child, { onPress });
    },
    useRouter: () => ({ push: pushMock }),
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const Ionicons = (props: any) => React.createElement('span', props, null);
  (Ionicons as any).glyphMap = {};
  return { Ionicons };
});

jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ background:'#fff', text:'#111', primary:'#06f', onPrimary:'#fff', muted:'#ccc', surface:'#f9f9f9', card:'#f5f5f5' }) }));
jest.mock('../theme/typography', () => ({ useTextScale: () => ({ factor: 1 }) }));

jest.mock('../i18n', () => {
  const React = require('react');
  return {
    I18nProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useTranslation: () => ({ t: (k: string, def?: string) => def || k, lang: 'en' }),
  };
});

jest.mock('../components/A11yPressable', () => {
  const React = require('react');
  return ({ children, onPress }: any) => React.createElement('button', { onClick: onPress }, children);
});

jest.mock('react-native', () => ({
  StyleSheet: { create: (o: any) => o },
  ScrollView: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
  View: ({ children }: any) => <div>{children}</div>,
}));

import { fireEvent, render, screen } from '@testing-library/react';

import AssistantHub from '../app/(tabs)/advocacy/assistant-hub';

import { TestProviders } from './TestProviders';

jest.mock('../services/usage', () => {
  const now = 1_700_000_000_000;
  const buffer = [
    { type: 'usage.view', tool: 'unknown_tool', ts: now - 1000 },
  ];
  return { usage: { getBuffer: () => buffer, view: jest.fn() } };
});

describe('Assistant Recent Tools fallback route', () => {
  beforeEach(() => pushMock.mockReset());

  it('falls back to assistant hub route when route is missing', () => {
    render(
      <TestProviders>
        <AssistantHub />
      </TestProviders>
    );
    // Label should be raw tool name when unknown
    expect(screen.getByText('unknown_tool')).toBeTruthy();
    fireEvent.click(screen.getByText('unknown_tool'));
    expect(pushMock).toHaveBeenCalledWith({ pathname: '/(tabs)/advocacy/assistant-hub' });
  });
});
