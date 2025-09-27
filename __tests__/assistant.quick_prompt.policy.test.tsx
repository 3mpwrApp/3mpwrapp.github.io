// Mock expo-router to avoid actual navigation, capture push calls
jest.mock('expo-router', () => {
  return {
    Link: ({ children }: any) => children,
    useRouter: () => ({ push: jest.fn() }),
  };
});

// Mock vector icons to a lightweight component
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const Ionicons = (props: any) => React.createElement('span', props, null);
  (Ionicons as any).glyphMap = {};
  return { Ionicons };
});

// Mock palette and typography hooks to avoid provider requirements
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ background:'#fff', text:'#111', primary:'#06f', onPrimary:'#fff', muted:'#ccc', surface:'#f9f9f9', card:'#f5f5f5' }) }));
jest.mock('../theme/typography', () => ({ useTextScale: () => ({ factor: 1 }) }));
// Minimal i18n mock to return default string if provided
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k:string, def?:string) => def || k, lang: 'en' }) }));
// Mock A11yPressable to a plain button
jest.mock('../components/A11yPressable', () => {
  const React = require('react');
  return ({ children, onPress }: any) => React.createElement('button', { onClick: onPress }, children);
});

// Provide minimal react-native primitives used by AssistantHub
jest.mock('react-native', () => ({
  StyleSheet: { create: (o: any) => o },
  ScrollView: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
  View: ({ children }: any) => <div>{children}</div>,
}));

import { fireEvent, render } from '@testing-library/react';

import AssistantHub from '../app/(tabs)/advocacy/assistant-hub';
import * as analyticsClient from '../services/analyticsClient';
import { SettingsProvider } from '../store/settings';

describe('Assistant Hub quick prompts (policy)', () => {
  it('emits assistant.quick_prompt when tapping the policy simplifier prompt', () => {
    const events: analyticsClient.AnalyticsEvent[] = [] as any;
    analyticsClient.setAnalyticsSink((n, p) => { events.push({ name: n, params: p }); });
    try {
      const { getByText } = render(
        <SettingsProvider>
          <AssistantHub />
        </SettingsProvider>
      );
      const chip = getByText('Explain this policy in plain language');
      fireEvent.click(chip);
    } finally {
      analyticsClient.setAnalyticsSink(null);
    }
    const found = events.find(e => e.name === 'assistant.quick_prompt');
    expect(found).toBeTruthy();
    expect(found?.params).toBeTruthy();
    expect((found as any).params.label).toEqual(expect.any(String));
  });
});
