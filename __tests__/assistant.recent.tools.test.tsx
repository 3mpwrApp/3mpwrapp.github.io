// Shared assistant test setup (palette, typography, i18n, A11yPressable)
import './__helpers__/assistantTestSetup';
// Use global expo-router mock; capture router.push
import { fireEvent, render, screen } from '@testing-library/react';
import { router } from 'expo-router';

import AssistantHub from '../app/(tabs)/advocacy/assistant-hub';

import { TestProviders } from './TestProviders';
const pushMock = router.push as jest.Mock;
beforeEach(() => pushMock.mockReset());

// Minimal usage buffer stub
jest.mock('../services/usage', () => {
  const now = 1_700_000_000_000;
  const buffer = [
    { type: 'usage.view', tool: 'translator', route: '/(tabs)/advocacy/ai-advocate-translator', ts: now - 1000 },
    { type: 'usage.view', tool: 'policy_simplifier', route: '/(tabs)/advocacy/policy-simple', ts: now - 2000 },
    { type: 'usage.complete', tool: 'coach', route: '/(tabs)/advocacy/self-advocacy-coach', ts: now - 3000 },
  ];
  return {
    usage: {
      getBuffer: () => buffer,
      view: jest.fn(),
    },
  };
});

describe('Assistant Recent Tools', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it('renders recent tool chips from usage buffer and navigates on press', () => {
    render(
      <TestProviders>
        <AssistantHub />
      </TestProviders>
    );

    // Expect mapped labels from mapToolLabel
    expect(screen.getByText('Translator')).toBeTruthy();
    expect(screen.getByText('Policy')).toBeTruthy();
    expect(screen.getByText('Coach')).toBeTruthy();

    const btn = screen.getByRole('button', { name: /Open recent tool: Translator/i });
    fireEvent.click(btn);
    // Changed from object format to string format after Link asChild removal
    expect(pushMock).toHaveBeenCalledWith('/(tabs)/advocacy/ai-advocate-translator');
  });
});
