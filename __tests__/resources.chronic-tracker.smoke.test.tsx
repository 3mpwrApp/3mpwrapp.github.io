import { fireEvent, render } from '@testing-library/react';

// Minimal mocks to stabilize RN web tests
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {} }));

// Mock chronic services to avoid storage
jest.mock('../services/chronic', () => ({
  addEntry: async () => {},
  listEntries: async () => [],
  deleteEntry: async () => {},
}));

// Mock native modules used for export so presses don't fail
jest.mock('expo-file-system', () => ({
  cacheDirectory: '/tmp/',
  EncodingType: { UTF8: 'utf8' },
  writeAsStringAsync: async () => {},
  readAsStringAsync: async () => '[]',
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: async () => false,
  shareAsync: async () => {},
}));
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: async () => ({ assets: [] }),
}));

const Mod = require('../app/(tabs)/resources/chronic-tracker');
const ChronicTracker = (Mod && Mod.default) ? Mod.default : Mod;

describe('Chronic Tracker (smoke)', () => {
  it('renders and triggers exports', async () => {
    const { getByText, getByPlaceholderText } = render(<ChronicTracker />);
    // Add entry path (does nothing due to mocks but should not crash)
    fireEvent.change(getByPlaceholderText(/Symptom/i) as any, { target: { value: 'Headache' } });
    fireEvent.change(getByPlaceholderText(/Severity 1-10/i) as any, { target: { value: '5' } });
    (fireEvent as any).press(getByText(/Add Entry/i));
    // Export buttons
    (fireEvent as any).press(getByText(/Export CSV/i));
    (fireEvent as any).press(getByText(/Export JSON/i));
  });
});
