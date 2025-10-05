import { fireEvent, render, waitFor } from '@testing-library/react';

// Palette and a11y minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {} }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(async () => null), setItem: jest.fn(async () => {}), removeItem: jest.fn(async () => {}) } }));

// File export mocks
jest.mock('expo-file-system', () => {
  const mod = { cacheDirectory: '/tmp/', EncodingType: { UTF8: 'utf8' }, writeAsStringAsync: async () => {} };
  return { __esModule: true, ...mod, default: mod };
});
jest.mock('expo-sharing', () => {
  const mod = { isAvailableAsync: async () => false, shareAsync: async () => {} };
  return { __esModule: true, ...mod, default: mod };
});

const Mod = require('../app/(tabs)/wellness/rehab-games');
const RehabGames = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Rehab Games (smoke)', () => {
  it('renders and logs actions; exports CSV without crash', async () => {
    const { getAllByText, getByLabelText } = render(<RehabGames />);
    // Header present
    expect(getAllByText(/Rehab Games|Virtual Rehab/i).length).toBeGreaterThan(0);
    // Press a few actions
    (fireEvent as any).press(getByLabelText(/reach & tap/i));
    (fireEvent as any).press(getByLabelText(/breath pacing/i));
    (fireEvent as any).press(getByLabelText(/sit-to-stand/i));
    // Export
    (fireEvent as any).press(getByLabelText(/Export rehab progress as CSV/i));
    await waitFor(() => true);
  });
});
