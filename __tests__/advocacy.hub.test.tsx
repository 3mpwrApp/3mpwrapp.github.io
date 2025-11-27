import { render } from '@testing-library/react';

import AdvocacyHub from '../app/(tabs)/advocacy/index';
import { FavoritesProvider } from '../store/favorites';
import { SettingsProvider } from '../store/settings';
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('../components/JurisdictionPanel', () => ({ JurisdictionPanel: () => null }));
jest.mock('../components/JurisdictionDeadlineCalculator', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/JurisdictionFormHelper', () => ({ __esModule: true, default: () => null }));
jest.mock('../store/jurisdiction', () => ({ 
  useJurisdiction: () => ({ code: 'ON', data: null, all: [] }),
  JurisdictionProvider: ({children}: any) => children 
}));
jest.mock('../store/complexityMode', () => ({
  useComplexityMode: () => ({
    mode: 'power_user',
    isFeatureVisible: () => true,
    isBadDayMode: false,
    setMode: jest.fn(),
    setBadDayMode: jest.fn(),
  }),
  ComplexityModeProvider: ({children}: any) => children,
}));

jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k:string) => {
  const map: Record<string,string> = {
    'advocacy.tools.ai_translator':'advocacy.tools.ai_translator',
    'advocacy.tools.ai_case':'advocacy.tools.ai_case',
    'advocacy.tools.ai_gov':'advocacy.tools.ai_gov',
    'advocacy.tools.ally_hub':'advocacy.tools.ally_hub',
    'advocacy.tools.collective':'advocacy.tools.collective',
    'advocacy.tools.finder':'advocacy.tools.finder',
    'advocacy.tools.policy_simple':'advocacy.tools.policy_simple',
    'advocacy.tools.ratings':'advocacy.tools.ratings',
    'advocacy.tools.self_coach':'advocacy.tools.self_coach',
    'advocacy.tools.accountability':'advocacy.tools.accountability',
    'advocacy.tools.accountability_cases':'advocacy.tools.accountability_cases',
    'advocacy.hubs.ai.title':'AI Command Center',
    'advocacy.hubs.network.title':'Advocacy Network',
    'advocacy.hubs.accountability.title':'Accountability Hub',
    'advocacy.hubs.evidence.title':'Evidence Manager',
  };
  return map[k] || k;
} }) , I18nProvider: ({children}: any) => children }));
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ background:'#fff', text:'#111', primary:'#06f', onPrimary:'#fff', muted:'#ccc', surface:'#f9f9f9' }) }));
jest.mock('expo-router', () => ({
  Link: ({children}: any) => children,
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}));
// Provide minimal StyleSheet mock
// Use the global react-native mock provided in jest.setup.js

describe('AdvocacyHub', () => {
  it('renders all feature hubs from i18n map', async () => {
  const { container } = render(
    <SettingsProvider>
      <FavoritesProvider>
        <AdvocacyHub />
      </FavoritesProvider>
    </SettingsProvider>
  );
    // Updated to match new hub-based structure
    const titles = [
      'AI Command Center',
      'Advocacy Network',
      'Accountability Hub',
      'Evidence Manager',
    ];
    // Count how many expected keys appear anywhere in the rendered text
    const allText = container.textContent || '';
    const foundCount = titles.reduce((acc, t) => acc + (allText.includes(t) ? 1 : 0), 0);
    if (foundCount !== titles.length) {
      // eslint-disable-next-line no-console
      console.log('Rendered HTML:', container.innerHTML);
    }
    expect(foundCount).toBe(titles.length);
  });
});
