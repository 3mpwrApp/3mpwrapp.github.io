import { render } from '@testing-library/react';

import AdvocacyHub from '../app/(tabs)/advocacy/index';
jest.mock('../components/JurisdictionPanel', () => ({ JurisdictionPanel: () => null }));

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
    'advocacy.tools.accountability_cases':'advocacy.tools.accountability_cases'
  };
  return map[k] || k;
} }) }));
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ background:'#fff', text:'#111', primary:'#06f', onPrimary:'#fff', muted:'#ccc', surface:'#f9f9f9' }) }));
jest.mock('expo-router', () => ({ Link: ({children}: any) => children }));
// Provide minimal StyleSheet mock
jest.mock('react-native', () => ({
  StyleSheet: { create: (o:any)=> o },
  ScrollView: ({children}:any)=> <div>{children}</div>,
  Text: ({children}:any)=> <span>{children}</span>,
  View: ({children}:any)=> <div>{children}</div>,
}));

describe('AdvocacyHub', () => {
  it('renders all feature titles from i18n map', async () => {
  const { queryByText, container } = render(<AdvocacyHub />);
    const titles = [
      'advocacy.tools.ai_translator',
      'advocacy.tools.ai_case',
      'advocacy.tools.ai_gov',
      'advocacy.tools.ally_hub',
      'advocacy.tools.collective',
      'advocacy.tools.finder',
      'advocacy.tools.policy_simple',
      'advocacy.tools.ratings',
      'advocacy.tools.self_coach',
      'advocacy.tools.accountability',
      'advocacy.tools.accountability_cases'
    ];
    // Count how many expected keys appear as text nodes
  const foundCount = titles.reduce((acc, t) => acc + (queryByText(t) ? 1 : 0), 0);
    if (foundCount !== titles.length) {
      // eslint-disable-next-line no-console
      console.log('Rendered HTML:', container.innerHTML);
    }
    expect(foundCount).toBe(titles.length);
  });
});
