import { fireEvent, render } from '@testing-library/react';

jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));

const Mod = require('../app/(tabs)/wellness/belief-meter');
const Screen = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Belief Strength Meter (smoke)', () => {
  it('measures without crash', () => {
    const { getByText } = render(<Screen />);
    expect(getByText(/Belief Strength Meter/i)).toBeTruthy();
    (fireEvent as any).press(getByText(/Measure/i));
  });
});
