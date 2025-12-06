import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import ChangelogGate from '../components/ChangelogGate';

import { TestProviders } from './TestProviders';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined)
}));

// Mock palette to avoid calling useSettings() inside useAppPalette()
jest.mock('../theme/usePalette', () => ({
  useAppPalette: () => ({
    primary: '#004D40',
    background: '#FFFFFF',
    text: '#000',
    muted: '#ccc',
    onPrimary: '#fff',
    surface: '#fff',
    card: '#f0f0f0',
    error: '#f00',
    success: '#0f0',
    warning: '#ffa500',
  })
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <TestProviders>
      <ChangelogGate>{children}</ChangelogGate>
    </TestProviders>
  );
}

describe('ChangelogGate', () => {
  it('shows overlay when CHANGELOG_ID not seen and dismisses on Got it', async () => {
    render(<Wrapper><>
      <TestChild />
    </></Wrapper>);

    // Overlay container is labeled for accessibility
    // Use character class to match both straight and curly apostrophes
    const overlay = await screen.findByLabelText(/What[''']s new/i);
    expect(overlay).toBeTruthy();

    // Dismiss
  const btn = await screen.findByText(/Got it/i);
  // In our test setup, fireEvent.press is aliased to click; accommodate both typings
  (fireEvent as any).press ? (fireEvent as any).press(btn) : fireEvent.click(btn as any);

    await waitFor(() => {
      expect(screen.queryByLabelText(/What[''']s new/i)).toBeNull();
    });
  });
});

function TestChild() {
  return <></>;
}
