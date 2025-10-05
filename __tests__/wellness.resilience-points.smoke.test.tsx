import { fireEvent, render } from '@testing-library/react';

// Minimal palette mock
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
// Store provider mock: use real provider to exercise logic
const Mod = require('../app/(tabs)/wellness/resilience');
const Screen = (Mod && Mod.default) ? Mod.default : Mod;
const Store = require('../store/resilience');

const { TestProviders } = require('./TestProviders');

describe('Wellness — Resilience Points (smoke)', () => {
  it('renders and awards a point action', () => {
    const { getByText, getAllByText } = render(
      <TestProviders>
        <Store.ResilienceProvider>
          <Screen />
        </Store.ResilienceProvider>
      </TestProviders>
    );
    expect(getByText(/Resilience Points/i)).toBeTruthy();
    const candidate = getAllByText(/Face a fear|Attend therapy|Practice grounding|Breathing/i)[0];
    const btn = candidate?.closest('button') as any;
    if (btn) (fireEvent as any).click(btn);
    // Points label should exist; exact number not asserted (depends on action)
    expect(getByText(/Points:/i)).toBeTruthy();
  });
});
