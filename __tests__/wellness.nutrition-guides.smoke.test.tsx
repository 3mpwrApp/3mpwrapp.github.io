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

// Data recipes mock (keep minimal shape)
jest.mock('../data/recipes', () => ({ recipes: [
  { id:'a', title:'Gentle Breakfast', tags:['breakfast','easy'], url:'https://example.com/a' },
  { id:'b', title:'Comfort Soup', tags:['lunch','comfort'] },
] }));

const Mod = require('../app/(tabs)/wellness/nutrition-guides');
const NutritionGuides = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Nutrition Guides (smoke)', () => {
  it('renders, filters, favorites, and exports without crash', async () => {
    const { getByText, getByLabelText } = render(<NutritionGuides />);
    expect(getByText(/Nutrition Guides/i)).toBeTruthy();
  // Filter using a specific chip and toggle a favorite
  (fireEvent as any).press(getByLabelText(/Filter recipes by tag: breakfast/i));
    (fireEvent as any).press(getByText(/☆ Favorite|★ Favorited/i));
    // Export favorites CSV
    (fireEvent as any).press(getByLabelText(/Export nutrition favorites as CSV/i));
    await waitFor(() => true);
  });
});
