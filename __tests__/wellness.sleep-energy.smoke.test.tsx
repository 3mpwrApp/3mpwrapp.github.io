import { fireEvent, render } from '@testing-library/react';

// Minimal mocks for palette and a11y hooks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ 
  MAX_FONT_SCALE: 2, 
  useAnnounceOnMount: () => {}, 
  useFocusOnRefOnMount: () => {},
  useScreenReaderEnabled: () => false,
  useReduceMotionEnabled: () => false
}));

// Cache + privacy mocks
jest.mock('../services/cache', () => ({ getCachedJSON: jest.fn(async()=>null), setCachedJSON: jest.fn(async()=>{}) }));
jest.mock('../store/privacy', () => ({ usePrivacy: () => ({ state: { lockWellness: false } }) }));
jest.mock('expo-print', () => ({ printToFileAsync: async () => ({ uri: 'file:///tmp/x.pdf' }) }));
jest.mock('expo-file-system', () => ({ cacheDirectory: '/tmp/', EncodingType: { UTF8: 'utf8' }, writeAsStringAsync: async () => {} }));
jest.mock('expo-clipboard', () => ({ setStringAsync: async () => {} }));
jest.mock('react-native/Libraries/Share/Share', () => ({ __esModule: true, default: { share: async () => ({ action: 'sharedAction' }) } }));

const Mod = require('../app/(tabs)/wellness/sleep-energy-tracker');
const SleepEnergy = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Sleep & Energy Tracker (smoke)', () => {
  it('adds an entry and triggers share/copy/csv/pdf exports without crashing', async () => {
    const { getByText, getByLabelText } = render(<SleepEnergy />);
    // Fill minimal fields and add
    (fireEvent as any).change(getByLabelText(/Sleep hours input/i), { target: { value: '7' } });
    (fireEvent as any).change(getByLabelText(/Sleep quality input/i), { target: { value: '4' } });
    (fireEvent as any).change(getByLabelText(/Energy input/i), { target: { value: '3' } });
    (fireEvent as any).press(getByText(/^Add Entry$/));

    // Trigger share/copy/csv/pdf actions
    (fireEvent as any).press(getByText(/^Share$/));
    (fireEvent as any).press(getByText(/Copy to clipboard/i));
    (fireEvent as any).press(getByText(/^Export as \.doc$/));
    (fireEvent as any).press(getByText(/^Export CSV$/));
    (fireEvent as any).press(getByText(/^Export CSV File$/));
    (fireEvent as any).press(getByText(/^Export as PDF$/));

  // Summary text includes a unique header line
  expect(getByText(/Sleep & Energy Summary for Claim Support/i)).toBeTruthy();
  });
});
