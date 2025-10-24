import { fireEvent, render, waitFor } from '@testing-library/react';
import { Alert } from 'react-native';

// Minimal palette and a11y mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ 
  MAX_FONT_SCALE: 2, 
  useAnnounceOnMount: () => {}, 
  useFocusOnRefOnMount: () => {},
  useScreenReaderEnabled: () => false,
  useReduceMotionEnabled: () => false
}));
jest.mock('../i18n', () => ({
  useTranslation: () => ({ t: (key: string, fb?: string) => fb || key }),
  useTranslationSafe: () => ({ t: (key: string, fb?: string) => fb || key })
}));

// Router mock for favorites navigation
jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
  router: { push: jest.fn() },
}));

// AsyncStorage for favorites
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(async () => null), setItem: jest.fn(async () => {}) },
}));

// File export mocks
const writeAsStringAsync = jest.fn(async () => {});
jest.mock('expo-file-system', () => {
  const mod = { cacheDirectory: '/tmp/', EncodingType: { UTF8: 'utf8' }, writeAsStringAsync };
  return { __esModule: true, ...mod, default: mod };
});
jest.mock('expo-sharing', () => {
  const mod = { isAvailableAsync: async () => false, shareAsync: async () => {} };
  return { __esModule: true, ...mod, default: mod };
});

// Data and YouTube mocks
jest.mock('../data/exercises', () => ({ exercises: [
  { id: 'e1', title: 'Chair stretch', minutes: 5, url: 'https://example.com/1', audience: 'limited-mobility' },
  { id: 'e2', title: 'Sensory calm', minutes: 7, url: 'https://example.com/2', audience: 'sensory-friendly' },
] }));
jest.mock('../services/youtube', () => ({ fetchExercisePlaylist: async () => [] }));

const Mod = require('../app/(tabs)/wellness/exercise-hub');
const ExerciseHub = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Exercise Hub (smoke)', () => {
  it('filters, favorites, and exports CSV without crash', async () => {
  const { getByText, getByLabelText, queryByText } = render(<ExerciseHub />);

    // Screen header
    expect(getByText(/Accessible Exercise Hub/i)).toBeTruthy();

    // Filter chips are present and toggle selection
    (fireEvent as any).press(getByLabelText(/Filter exercises for: limited-mobility/i));

    // Favorite first exercise
  const favBtn = getByLabelText(/Add Chair stretch to favorites/i);
  (fireEvent as any).press(favBtn);
  await waitFor(() => expect(queryByText(/★ Favorited/i)).toBeTruthy());

    // Export CSV
  (fireEvent as any).press(getByLabelText(/Export exercise favorites as CSV/i));
  await waitFor(() => expect((Alert as any).alert).toHaveBeenCalled(), { timeout: 1500 });
  });
});
