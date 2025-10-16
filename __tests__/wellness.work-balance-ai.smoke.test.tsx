import { fireEvent, render, waitFor } from '@testing-library/react';
import { Alert } from 'react-native';

// Palette and a11y minimal mocks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {}, useScreenReaderEnabled: () => false, useReduceMotionEnabled: () => false }));

// Cache mocks for getCachedJSON
jest.mock('../services/cache', () => ({ getCachedJSON: async () => [] }));

// Clipboard mock
jest.mock('expo-clipboard', () => ({ __esModule: true, setStringAsync: async () => {} }));

const Mod = require('../app/(tabs)/wellness/work-balance-ai');
const WorkBalance = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Work-Balance AI (smoke)', () => {
  it('generates a plan and allows copy', async () => {
    const { getByText, findByText } = render(<WorkBalance />);
    expect(getByText(/Work Balance AI/i)).toBeTruthy();
    (fireEvent as any).press(getByText(/Plan my day/i));
    // After generation, a Copy button appears in the results box
    const copyBtn = await findByText(/Copy/i);
    (fireEvent as any).press(copyBtn);
    await waitFor(() => expect(Alert.alert).not.toHaveBeenCalledWith('Error', expect.anything()));
  });
});
