import { render } from '@testing-library/react';

jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));

const Mod = require('../app/(tabs)/wellness/distress-tolerance');
const Screen = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Distress Tolerance (smoke)', () => {
  it('renders tips without crash', () => {
    const { getByText } = render(<Screen />);
    expect(getByText(/Distress Tolerance/i)).toBeTruthy();
  });
});
