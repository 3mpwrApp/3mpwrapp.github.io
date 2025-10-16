import { fireEvent, render, waitFor } from '@testing-library/react';

// Minimal palette and a11y mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {}, useScreenReaderEnabled: () => false, useReduceMotionEnabled: () => false }));

// AsyncStorage mock (used for tapAction/backdate prefs)
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
  },
}));

// Native module/file ops mocks for exports
jest.mock('expo-file-system', () => {
  const mod = { cacheDirectory: '/tmp/', EncodingType: { UTF8: 'utf8' }, writeAsStringAsync: jest.fn(async () => {}) };
  return { __esModule: true, ...mod, default: mod };
});
jest.mock('expo-sharing', () => {
  const mod = { isAvailableAsync: async () => false, shareAsync: async () => {} };
  return { __esModule: true, ...mod, default: mod };
});

// Wellness service mocks
const addReflection = jest.fn(async (..._args: any[]) => {});
const addReflectionAt = jest.fn(async (..._args: any[]) => true);
const updateReflection = jest.fn(async (..._args: any[]) => {});
const deleteReflection = jest.fn(async (..._args: any[]) => {});
const today = new Date(); today.setHours(12,0,0,0);
const fiveDaysAgo = new Date(today); fiveDaysAgo.setDate(today.getDate() - 5);
jest.mock('../services/wellness', () => ({
  addReflection,
  addReflectionAt,
  updateReflection,
  deleteReflection,
  listReflections: async () => [
    { id: 'a', mood: 'good', note: 'Felt okay', createdAt: { toDate: () => today } },
    { id: 'b', mood: 'bad', note: 'Tough day', createdAt: { toDate: () => fiveDaysAgo } },
  ],
}));

const Mod = require('../app/(tabs)/wellness/reflections-calendar');
const ReflectionsCalendar = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Reflections Calendar (smoke)', () => {
  it('renders grid/list, opens details and exports without crash', async () => {
  const { getByText, getByLabelText, getAllByLabelText, queryByLabelText, findByText } = render(<ReflectionsCalendar />);

    // Header
    expect(getByText(/Reflections Calendar/i)).toBeTruthy();

    // Switch to list view via labeled chip
    (fireEvent as any).press(getByLabelText(/Switch to list view/i));

    // Wait for list row to show a day label or placeholder
    await findByText(/No reflections yet\.|Current Streak|Entries:/i);

    // Open details for a day (tap first accessible day row)
  const dayBtn = getAllByLabelText(/View day .* with entry/i)[0];
    (fireEvent as any).press(dayBtn);

    // In details, add a reflection to open editor and save
    (fireEvent as any).press(getByLabelText(/Add reflection/i));
    (fireEvent as any).press(getByLabelText(/Save reflection/i));

    // One of addReflection or addReflectionAt should have been used
    await waitFor(() => {
      expect(addReflection.mock.calls.length + addReflectionAt.mock.calls.length).toBeGreaterThan(0);
    });

  // Close details dialog to access top-level export buttons (label may vary)
  const closeDialog = queryByLabelText(/Close dialog/i) || queryByLabelText(/Close details/i);
  if (closeDialog) (fireEvent as any).press(closeDialog);

    // Export CSV (file write called)
    (fireEvent as any).press(getByLabelText(/Export reflections as CSV/i));
    await waitFor(() => {
      const FS = require('expo-file-system');
      expect(FS.writeAsStringAsync).toHaveBeenCalled();
    });
  });
});
