import { fireEvent, render } from '@testing-library/react';

// Minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
// Use the complete mock from __mocks__/useA11y.js instead of partial inline mock
jest.mock('../hooks/useA11y', () => ({
  MAX_FONT_SCALE: 2,
  useAnnounceOnMount: jest.fn(),
  useFocusOnRefOnMount: jest.fn(),
}));
jest.mock('../i18n', () => ({
  useTranslation: () => ({ t: (key: string, fb?: string) => fb || key })
}));
jest.mock('../components/A11yPressable');
jest.mock('../components/DisclaimerBanner');
jest.mock('../components/GapView');

jest.mock('../services/companion', () => ({
  addMood: jest.fn(async ()=>{}),
  listMoods: jest.fn(async ()=>[
    { id:'1', mood:'good', notes:'nice day', createdAt: { toDate: () => new Date() } }
  ]),
}));
jest.mock('../services/notifications', () => ({ scheduleAt: jest.fn(async ()=>{}) }));
jest.mock('expo-file-system', () => ({ cacheDirectory: '/tmp/', EncodingType: { UTF8:'utf8' }, writeAsStringAsync: async () => {} }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: async () => false, shareAsync: async () => {} }));

const Mod = require('../app/(tabs)/wellness/ai-companion');
const AICompanion = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Adaptive AI Companion (smoke)', () => {
  it.skip('logs a mood, schedules reminders, and exports moods without crash', async () => {
    const { getByText, getByLabelText } = render(<AICompanion />);
    // Screen renders
    expect(getByText(/Adaptive AI Companion/i)).toBeTruthy();

    // Enter notes and log a mood
    (fireEvent as any).change(getByLabelText(/Mood notes input/i), { target: { value: 'tired but okay' } });
    (fireEvent as any).press(getByText(/good/i));

    // Schedule daily check-ins and hydration and export moods
    (fireEvent as any).press(getByText(/Schedule daily check-ins/i));
    (fireEvent as any).press(getByText(/Hydration in 1 min/i));
    (fireEvent as any).press(getByText(/Export moods \(CSV\)/i));

    // Recent moods heading renders
    expect(getByText(/Recent moods/i)).toBeTruthy();
  });
});
