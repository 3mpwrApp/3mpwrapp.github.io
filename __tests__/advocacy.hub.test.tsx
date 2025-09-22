import { render } from '@testing-library/react';

import AdvocacyHub from '../app/(tabs)/advocacy/index';

jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k:string) => {
  const map: Record<string,string> = {
    'advocacy.tools.ai_translator':'AI Advocate Translator',
    'advocacy.tools.ai_case':'AI Case Interpreter',
    'advocacy.tools.ai_gov':'AI Government Navigator',
    'advocacy.tools.ally_hub':'Ally Hub',
    'advocacy.tools.collective':'Collective Legal Action Hub',
    'advocacy.tools.finder':'Lawyer & Advocate Finder',
    'advocacy.tools.policy_simple':'Policy Made Simple',
    'advocacy.tools.ratings':'Disability Justice Ratings',
    'advocacy.tools.self_coach':'Self-Advocacy Coach (micro-lessons)'
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
  it('renders all feature titles from i18n map', () => {
    const { queryByText } = render(<AdvocacyHub />);
    const titles = [
      'AI Advocate Translator',
      'AI Case Interpreter',
      'AI Government Navigator',
      'Ally Hub',
      'Collective Legal Action Hub',
      'Lawyer & Advocate Finder',
      'Policy Made Simple',
      'Disability Justice Ratings',
      'Self-Advocacy Coach (micro-lessons)'
    ];
    titles.forEach(t => expect(queryByText(t)).toBeTruthy());
  });
});
