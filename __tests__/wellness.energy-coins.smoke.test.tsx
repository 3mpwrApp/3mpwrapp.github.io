import { fireEvent, render } from '@testing-library/react';

import { TestProviders } from './TestProviders';

// Minimal mocks for palette and a11y hooks
jest.mock('../theme/usePalette', () => ({
  useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' })
}));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {} }));

// Analytics client is optional
jest.mock('../services/analyticsClient', () => ({ trackEvent: jest.fn() }));

// Be robust to default vs CJS export
const Mod = require('../app/(tabs)/wellness/energy-coins');
const EnergyCoins = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Energy Coins (smoke)', () => {
  it('allows setting daily coins, spending, and resetting without crash', () => {
    const { getByText, getByPlaceholderText } = render(
      <TestProviders>
        <EnergyCoins />
      </TestProviders>
    );

    // Header and remaining text render
    expect(getByText(/Daily Energy Coins/i)).toBeTruthy();
    expect(getByText(/Remaining coins:/i)).toBeTruthy();

    // Set daily coins to 12
    const dailyInput = getByPlaceholderText(/Daily coins/i);
    (fireEvent as any).change(dailyInput, { target: { value: '12' } });
    (fireEvent as any).press(getByText(/^Set$/));

    // Spend 3 coins
    const labelInput = getByPlaceholderText(/Task label/i);
    const costInput = getByPlaceholderText(/Cost/i);
    (fireEvent as any).change(labelInput, { target: { value: 'Test task' } });
    (fireEvent as any).change(costInput, { target: { value: '3' } });
    (fireEvent as any).press(getByText(/^Spend$/));

    // Reset day
    (fireEvent as any).press(getByText(/Reset day/i));

    // Still renders remaining and history without crashing
    expect(getByText(/Remaining coins:/i)).toBeTruthy();
    expect(getByText(/History/i)).toBeTruthy();
  });
});
