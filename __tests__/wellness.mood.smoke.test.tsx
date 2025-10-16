import { render } from '@testing-library/react';

jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k:string, d?:any) => (d ?? k) }) }));
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#111', onPrimary:'#fff', primary:'#06f', muted:'#ddd', background:'#fff', surface:'#fafafa' }) }));
jest.mock('../hooks/useA11y', () => ({ useScreenReaderEnabled: () => false, useReduceMotionEnabled: () => false, useAnnounceOnMount: () => {}, useFocusOnRefOnMount: () => {} }));
// Avoid importing real expo-router which pulls react-navigation assets
jest.mock('expo-router', () => ({ Link: ({ children }: any) => children }));

// Import after mocking
const React = require('react');

const { SettingsProvider } = require('../store/settings');
const Mod = require('../app/(tabs)/wellness.mood');
const Mood = (Mod && Mod.default) ? Mod.default : Mod;

describe('Mood Tracker (smoke)', () => {
  it('renders without crashing', () => {
    const { getByText } = render(
      <SettingsProvider>
        <Mood />
      </SettingsProvider>
    );
    // Verify key UI elements exist
    expect(getByText(/Mood Tracker/i)).toBeTruthy();
    expect(getByText(/Select your mood score/i)).toBeTruthy();
  });
});
