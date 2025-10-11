import { fireEvent, render, screen } from '@testing-library/react';

import AssistantHub from '../app/(tabs)/advocacy/assistant-hub';
import { withCapturedEvents } from '../services/analyticsClient';

import { TestProviders } from './TestProviders';

// Mock expo-router so Link works in other parts (not used directly here)
const pushMock = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Link: ({ children, href }: any) => {
      const child = React.Children.only(children);
      const origOnPress = child.props.onPress;
      const onPress = (...args: any[]) => {
        const pathname = typeof href === 'string' ? href : href?.pathname;
        pushMock({ pathname });
        if (typeof origOnPress === 'function') origOnPress(...args);
      };
      return React.cloneElement(child, { onPress });
    },
    useRouter: () => ({ push: pushMock }),
  };
});

// Mock vector icons to a lightweight component
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const Ionicons = (props: any) => React.createElement('span', props, null);
  (Ionicons as any).glyphMap = {};
  return { Ionicons };
});

// Mock palette and typography hooks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ background:'#fff', text:'#111', primary:'#06f', onPrimary:'#fff', muted:'#ccc', surface:'#f9f9f9', card:'#f5f5f5' }) }));
jest.mock('../theme/typography', () => ({ useTextScale: () => ({ factor: 1 }) }));

// Minimal i18n mock to work with TestProviders
jest.mock('../i18n', () => {
  const React = require('react');
  return {
    I18nProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useTranslation: () => ({ t: (k: string, def?: string) => def || k, lang: 'en' }),
  };
});

// Mock A11yPressable to a button
jest.mock('../components/A11yPressable', () => {
  const React = require('react');
  return ({ children, onPress }: any) => React.createElement('button', { onClick: onPress }, children);
});

// Mock RN primitives for jsdom
jest.mock('react-native', () => ({
  StyleSheet: { create: (o: any) => o },
  ScrollView: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
  TextInput: ({ value, onChangeText, placeholder }: any) => (
    <input
      value={value}
      onChange={(e: any) => onChangeText && onChangeText(e.target?.value)}
      placeholder={placeholder}
    />
  ),
  View: ({ children }: any) => <div>{children}</div>,
}));

// Usage buffer with clearRecents behavior
jest.mock('../services/usage', () => {
  const now = 1_700_000_000_000;
  let buffer = [
    { type: 'usage.view', tool: 'translator', route: '/(tabs)/advocacy/ai-advocate-translator', ts: now - 1000 },
    { type: 'usage.complete', tool: 'coach', route: '/(tabs)/advocacy/self-advocacy-coach', ts: now - 2000 },
  ];
  return {
    usage: {
      getBuffer: () => buffer,
      clearRecents: () => { buffer = buffer.filter((e: any) => !(e.type === 'usage.view' || e.type === 'usage.complete')); },
    },
  };
});

describe('Assistant Hub — Clear Recents', () => {
  it('shows Clear button, emits analytics, and empties recents after press', () => {
    const events = withCapturedEvents(() => {
      render(
        <TestProviders>
          <AssistantHub />
        </TestProviders>
      );

      // Recent items visible initially
      expect(screen.getByText('Recent')).toBeTruthy();
      expect(screen.getByText('Translator')).toBeTruthy();

      const clearBtn = screen.getByRole('button', { name: 'Clear' });
      fireEvent.click(clearBtn);
    });

    // After clearing, the recents section should not render
    expect(screen.queryByText('Recent')).toBeNull();
    expect(screen.queryByText('Translator')).toBeNull();

    // Analytics event emitted with count of cleared items (2 in mock buffer)
    expect(events).toEqual(
      expect.arrayContaining([
        { name: 'assistant.recents.clear', params: { count: 2 } }
      ])
    );
  });
});
