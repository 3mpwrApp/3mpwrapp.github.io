import { fireEvent, render, waitFor } from '@testing-library/react';

// Palette and a11y minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {} }));

// Firebase config and firestore mocks
jest.mock('../firebase/config', () => ({ auth: { currentUser: { uid: 'u1' } }, db: {} }));
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(async () => ({})),
  collection: jest.fn(() => ({})),
  orderBy: jest.fn(() => ({})),
  query: jest.fn(() => ({})),
  getDocs: jest.fn(async () => ({ docs: [] })),
  serverTimestamp: jest.fn(() => ({})),
}));

// Notifications mock
jest.mock('../services/notifications', () => ({ scheduleAt: jest.fn(async () => ({})) }));

// File export mocks
jest.mock('expo-file-system', () => {
  const mod = { cacheDirectory: '/tmp/', EncodingType: { UTF8: 'utf8' }, writeAsStringAsync: async () => {} };
  return { __esModule: true, ...mod, default: mod };
});
jest.mock('expo-sharing', () => {
  const mod = { isAvailableAsync: async () => false, shareAsync: async () => {} };
  return { __esModule: true, ...mod, default: mod };
});

const Mod = require('../app/(tabs)/wellness/pacing-partner');
const PacingPartner = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Pacing Partner (smoke)', () => {
  it('logs an activity and exports CSV without crash', async () => {
    const { getByLabelText, getAllByText } = render(<PacingPartner />);
    // Header present (there are two headings; we just ensure at least one contains Pacing Partner)
    expect(getAllByText(/Pacing Partner/i).length).toBeGreaterThan(0);
    // Enter minutes and type, then log
    const minInput: any = getByLabelText(/Minutes input/i);
    fireEvent.change(minInput, { target: { value: '10' } });
    const typeInput: any = getByLabelText(/Activity type input/i);
    fireEvent.change(typeInput, { target: { value: 'walk' } });
    (fireEvent as any).press(getByLabelText(/Log activity/i));
    // Export CSV (should not throw)
    (fireEvent as any).press(getByLabelText(/Export pacing activities as CSV/i));
    await waitFor(() => true);
  });
});
