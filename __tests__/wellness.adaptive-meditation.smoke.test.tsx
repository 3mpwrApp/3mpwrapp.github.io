import { fireEvent, render, waitFor } from '@testing-library/react';

jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ MAX_FONT_SCALE: 2, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {}, useScreenReaderEnabled: () => false, useReduceMotionEnabled: () => false }));
jest.mock('../i18n', () => ({
  useTranslation: () => ({ t: (key: string, fb?: string) => fb || key })
}));

// File export mocks
jest.mock('expo-file-system', () => {
  const mod = { cacheDirectory: '/tmp/', EncodingType: { UTF8: 'utf8' }, writeAsStringAsync: async () => {} };
  return { __esModule: true, ...mod, default: mod };
});
jest.mock('expo-sharing', () => {
  const mod = { isAvailableAsync: async () => false, shareAsync: async () => {} };
  return { __esModule: true, ...mod, default: mod };
});

// Audio mock
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: async () => ({ sound: { setOnPlaybackStatusUpdate: () => {}, stopAsync: async () => {}, unloadAsync: async () => {} } })
    }
  }
}));

const Mod = require('../app/(tabs)/wellness/adaptive-meditation');
const Screen = (Mod && Mod.default) ? Mod.default : Mod;

describe('Wellness — Adaptive Meditation (smoke)', () => {
  it('exports links and triggers play without crash', async () => {
    const { getAllByText, getByText, getByLabelText } = render(<Screen />);
    expect(getAllByText(/Adaptive Meditation/i).length).toBeGreaterThan(0);
    (fireEvent as any).press(getByLabelText(/Export meditation links as CSV/i));
    (fireEvent as any).press(getByText(/Breathing/i));
    await waitFor(() => true);
  });
});
