// Shared assistant test setup (palette, typography, i18n, A11yPressable)
import './__helpers__/assistantTestSetup';
// Use global expo-router mock to keep Link interactions working
import { fireEvent, render, screen } from '@testing-library/react';
import { router } from 'expo-router';

import AssistantHub from '../app/(tabs)/advocacy/assistant-hub';
import { withCapturedEvents } from '../services/analyticsClient';

import { TestProviders } from './TestProviders';
beforeEach(() => (router.push as jest.Mock).mockReset());

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

  // Accessible name may be aria-label ("Clear recent tools") or visible text ("Clear")
  const clearBtn = screen.getByRole('button', { name: /Clear( recent tools)?/i });
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
