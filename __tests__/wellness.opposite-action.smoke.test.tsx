import { fireEvent, render } from '@testing-library/react';

jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));
jest.mock('../services/analyticsClient', () => ({ trackEvent: () => {} }));

const Mod = require('../app/(tabs)/wellness/opposite-action');
const Screen = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Opposite Action (smoke)', () => {
  it('advances steps without crash', () => {
    const { getByText } = render(<Screen />);
    expect(getByText(/Opposite Action/i)).toBeTruthy();
    (fireEvent as any).press(getByText(/Next/i));
  });
});
