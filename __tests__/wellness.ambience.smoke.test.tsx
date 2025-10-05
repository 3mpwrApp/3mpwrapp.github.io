import { fireEvent, render } from '@testing-library/react';

// Mock Haptics to avoid native module init in test environment
jest.mock('expo-haptics', () => ({
  __esModule: true,
  impactAsync: async () => {},
  notificationAsync: async () => {},
  selectionAsync: async () => {},
}));
// Also stub the ambience service to avoid native imports entirely
jest.mock('../services/ambience', () => ({
  computeAmbience: () => ({ palette: 'calm', color: '#334155', soundscape: 'silence', brightness: 'low' }),
}));

// Palette and a11y/i18n/mood minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (_k: string, d?: string) => d || '' }) }));
jest.mock('../store/mood', () => ({ useMood: () => ({ entries: [], recentAverage: 0 }) }));

const Mod = require('../app/(tabs)/wellness/ambience');
const Ambience = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Ambience Sync AI (smoke)', () => {
  it('renders suggestion and allows apply press without crash', () => {
    const { getByText } = render(<Ambience />);
    expect(getByText(/Ambience Sync AI/i)).toBeTruthy();
    // Show suggestion line
    expect(getByText(/Suggestion/i)).toBeTruthy();
    // Press Apply button (no-op)
    (fireEvent as any).press(getByText(/Apply in app/i));
  });
});
