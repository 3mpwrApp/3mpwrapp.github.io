// Shared assistant test setup (palette, typography, i18n, A11yPressable)
import { fireEvent, render, screen } from '@testing-library/react';
import { router } from 'expo-router';
import './__helpers__/assistantTestSetup';

import AssistantHub from '../app/(tabs)/advocacy/assistant-hub';

import { TestProviders } from './TestProviders';

// Use global expo-router mock; capture router.push
const pushMock = router.push as jest.Mock;
beforeEach(() => pushMock.mockReset());

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
