import { fireEvent, render } from '@testing-library/react';

import { TestProviders } from './TestProviders';

// Minimal mocks for palette and a11y hooks
jest.mock('../theme/usePalette', () => ({
  useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' })
}));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {} }));

// Mock cache so component doesn't crash on async init
jest.mock('../services/cache', () => ({
  getCachedJSON: jest.fn(async () => null),
  setCachedJSON: jest.fn(async () => {}),
}));

// Be robust to default vs CJS export
const Mod = require('../app/(tabs)/advocacy/ai-gov-navigator');
const AiGov = (Mod && Mod.default) ? Mod.default : Mod;

describe('AI Government Navigator (smoke)', () => {
  it('renders and navigates steps offline', () => {
    const { getByText } = render(
      <TestProviders>
        <AiGov />
      </TestProviders>
    );
    // Header
    expect(getByText('AI Government Navigator')).toBeTruthy();
    // Initial step
    expect(getByText(/Step 1 of/)).toBeTruthy();
    // Next -> Step 2
  (fireEvent as any).press(getByText('Next'));
    expect(getByText(/Step 2 of/)).toBeTruthy();
    // Back -> Step 1
  (fireEvent as any).press(getByText('Back'));
    expect(getByText(/Step 1 of/)).toBeTruthy();
  });
});
