import { fireEvent, render } from '@testing-library/react';

jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));
jest.mock('../services/cache', () => ({ getCachedJSON: async () => [], setCachedJSON: async () => {} }));

const Mod = require('../app/(tabs)/wellness/acceptance-function');
const Screen = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Acceptance & Function (smoke)', () => {
  it('adds entry without crash', () => {
    const { getByText } = render(<Screen />);
    expect(getByText(/Acceptance & Function/i)).toBeTruthy();
    (fireEvent as any).press(getByText(/Add/i));
  });
});
