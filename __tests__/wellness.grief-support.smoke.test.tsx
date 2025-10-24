import { fireEvent, render, waitFor } from '@testing-library/react';

// Palette and a11y minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ 
  MAX_FONT_SCALE: 2, 
  useAnnounceOnMount: () => {}, 
  useFocusOnRefOnMount: () => {},
  useScreenReaderEnabled: () => false,
  useReduceMotionEnabled: () => false
}));
jest.mock('../i18n', () => ({
  useTranslation: () => ({ t: (key: string, fb?: string) => fb || key })
}));

// File export mocks
jest.mock('expo-file-system', () => {
  const mod = { cacheDirectory: '/tmp/', EncodingType: { UTF8: 'utf8' }, writeAsStringAsync: async () => {} };
  return { __esModule: true, ...mod, default: mod };
});
jest.mock('expo-sharing', () => {
  const mod = { isAvailableAsync: async () => false, shareAsync: async () => {} };
  return { __esModule: true, ...mod, default: mod };
});

const Mod = require('../app/(tabs)/wellness/grief-support');
const GriefSupport = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Grief Support (smoke)', () => {
  it('renders and exports resources CSV without crash', async () => {
    const { getByLabelText } = render(<GriefSupport />);
    (fireEvent as any).press(getByLabelText(/Export grief support resources as CSV/i));
    await waitFor(() => true);
  });
});
