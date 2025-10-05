import { fireEvent, render } from '@testing-library/react';

jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));
jest.mock('../services/wellness/dreams', () => ({
  useDreams: () => ({ entries: [{ id:'1', ts: Date.now(), text: 'flying over trees' }], add: () => {} }),
  interpretDream: () => 'Sense of freedom; watch for overexertion patterns.'
}));

const Mod = require('../app/(tabs)/wellness/dreams');
const Screen = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Dream Tracker (smoke)', () => {
  it('renders list and saves without crash', () => {
    const { getByText } = render(<Screen />);
    expect(getByText(/Dream Tracker/i)).toBeTruthy();
    (fireEvent as any).press(getByText(/Save/i));
  });
});
