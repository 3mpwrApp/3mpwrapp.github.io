import { fireEvent, render, screen } from '@testing-library/react';

import CollectiveLegal from '../app/(tabs)/advocacy/collective-legal';
import * as cache from '../services/cache';
import * as violations from '../services/violations';
jest.mock('../hooks/useA11y', () => ({ 
  useAnnounceOnMount: () => {}, 
  useFocusOnRefOnMount: () => {}, 
  useScreenReaderEnabled: () => false,
  useReduceMotionEnabled: () => false,
  MAX_FONT_SCALE: 2 
}));

// Mock palette + RN color scheme + settings to avoid native hooks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({
  primary:'#06f', onPrimary:'#fff', text:'#111', background:'#fff', muted:'#ccc', surface:'#fff'
}) }));
jest.mock('react-native', () => {
  // Provide only pieces actually touched during this test to avoid deep internal module resolution
  return {
    Alert: { alert: jest.fn() },
    Platform: { OS: 'web' },
    ScrollView: (props: any) => props.children,
    StyleSheet: { create: (s: any) => s },
    Text: (props: any) => props.children,
    TextInput: (_props: any) => null,
    View: (props: any) => props.children,
    Pressable: (props: any) => <button onClick={props.onPress}>{props.children}</button>,
    useColorScheme: () => 'light',
    I18nManager: { isRTL: false, forceRTL: () => {}, allowRTL: () => {} },
  };
});
jest.mock('../store/settings', () => ({ useSettings: () => ({ highContrast:false }) }));

jest.mock('../services/cache');
jest.mock('../services/violations');
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k:string, fb?:string) => fb || k }) }));

describe('CollectiveLegal', () => {
  it('renders and submits (smoke)', async () => {
    (cache.getCachedJSON as any).mockResolvedValueOnce(null);
  (violations.fsAddViolationReport as any).mockImplementation(() => Promise.resolve(true));

  render(<CollectiveLegal />);

  // Locate submit action by visible text (translation fallback or key)
  const submit = screen.getByText(/Submit report|advocacy\.collective\.submit/i);
  fireEvent.click(submit.closest('button') || submit);
  await new Promise(res => setTimeout(res,0));
  expect(violations.fsAddViolationReport).toHaveBeenCalledTimes(1);
  }, 15000);
});
