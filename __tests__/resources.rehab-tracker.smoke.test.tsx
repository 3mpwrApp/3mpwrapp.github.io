import { fireEvent, render, waitFor } from '@testing-library/react';
import { Alert } from 'react-native';

// Palette and a11y minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ 
  MAX_FONT_SCALE: 2, 
  useAnnounceOnMount: () => {}, 
  useFocusOnRefOnMount: () => {},
  useScreenReaderEnabled: () => false,
  useReduceMotionEnabled: () => false
}));

// AsyncStorage mock
const mem: Record<string,string|null> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(async (k:string)=> mem[k]||null), setItem: jest.fn(async (k:string,v:string)=>{ mem[k]=v; }) } }));

// Firebase config and firestore mocks
jest.mock('../firebase/config', () => ({ auth: { currentUser: { uid: 'u1' } }, db: {} }));
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(async () => ({})),
  collection: jest.fn(() => ({})),
  startAfter: jest.fn(() => ({})),
  getDocs: jest.fn(async () => ({ docs: [] })),
  orderBy: jest.fn(() => ({})),
  limit: jest.fn(() => ({})),
  query: jest.fn(() => ({})),
  serverTimestamp: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
}));

// File and document picker mocks
jest.mock('expo-file-system', () => {
  const mod = { cacheDirectory: '/tmp/', readAsStringAsync: async () => '[]', writeAsStringAsync: async () => {}, EncodingType: { UTF8: 'utf8' } };
  return { __esModule: true, ...mod, default: mod };
});
jest.mock('expo-sharing', () => ({ __esModule: true, isAvailableAsync: async () => false, shareAsync: async () => {} }));
jest.mock('expo-document-picker', () => ({ __esModule: true, getDocumentAsync: async () => ({ assets: [{ uri: '/tmp/template.json' }] }) }));

const Mod = require('../app/(tabs)/resources/rehab-tracker');
const RehabTracker = (Mod && Mod.default) ? Mod.default : Mod;

describe('Resources — Rehab Progress Tracker (smoke)', () => {
  it('adds, exports JSON, and imports template without crash', async () => {
    const { getByText, getByLabelText, getByPlaceholderText } = render(<RehabTracker />);
    expect(getByText(/Rehab Progress Tracker/i)).toBeTruthy();
    // Add a local entry
    (getByPlaceholderText(/Walking distance/i) as any).value = '300m';
    (getByPlaceholderText(/Walking distance/i) as any).dispatchEvent(new Event('change', { bubbles: true }));
    (fireEvent as any).press(getByLabelText(/Log progress entry/i));
    // Export JSON (no crash)
    (fireEvent as any).press(getByLabelText(/Export logs to JSON/i));
    // Import template (no crash)
    (fireEvent as any).press(getByLabelText(/Import template JSON/i));
    await waitFor(() => expect(Alert.alert).not.toHaveBeenCalledWith('Export failed', expect.anything()));
  });
});
