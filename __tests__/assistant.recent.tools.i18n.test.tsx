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

// Use real i18n provider; default lang en
jest.mock('../i18n', () => {
  const React = require('react');
  return {
    I18nProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useTranslation: () => ({ t: (k: string, def?: string) => {
      const map: Record<string,string> = {
        'assistant.tools.coach': 'Coach',
        'assistant.tools.translator': 'Translator',
        'assistant.tools.policy': 'Policy',
        'assistant.tools.mood': 'Mood',
        'assistant.tools.resources': 'Resources',
      };
      return map[k] || def || k;
    }, lang: 'en' }),
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

import { render, screen } from '@testing-library/react';

import AssistantHub from '../app/(tabs)/advocacy/assistant-hub';

import { TestProviders } from './TestProviders';

// Recent tools buffer
jest.mock('../services/usage', () => {
  const now = 1_700_000_000_000;
  const buffer = [
    { type: 'usage.view', tool: 'translator', route: '/(tabs)/advocacy/ai-advocate-translator', ts: now - 1000 },
  ];
  return { usage: { getBuffer: () => buffer, view: jest.fn() } };
});

describe('Assistant Recent Tools i18n labels', () => {
  it('uses localized labels for recent tools', () => {
    render(
      <TestProviders>
        <AssistantHub />
      </TestProviders>
    );
    expect(screen.getByText('Translator')).toBeTruthy();
  });
});
