import renderer, { act } from 'react-test-renderer';

import CollectiveLegal from '../app/(tabs)/advocacy/collective-legal';
import { I18nProvider } from '../i18n';
import * as cache from '../services/cache';
import * as violations from '../services/violations';

// Mock palette + RN color scheme + settings to avoid native hooks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({
  primary:'#06f', onPrimary:'#fff', text:'#111', background:'#fff', muted:'#ccc', surface:'#fff'
}) }));
jest.mock('react-native', () => {
  // Provide only pieces actually touched during this test to avoid deep internal module resolution
  return {
    Alert: { alert: jest.fn() },
    ScrollView: (props: any) => props.children,
    StyleSheet: { create: (s: any) => s },
    Text: (props: any) => props.children,
    TextInput: (_props: any) => null,
    View: (props: any) => props.children,
    Pressable: (props: any) => props.children,
    useColorScheme: () => 'light',
    I18nManager: { isRTL: false, forceRTL: () => {}, allowRTL: () => {} },
  };
});
jest.mock('../store/settings', () => ({ useSettings: () => ({ highContrast:false }) }));

jest.mock('../services/cache');
jest.mock('../services/violations');

describe('CollectiveLegal', () => {
  it('renders and submits (smoke)', async () => {
    (cache.getCachedJSON as any).mockResolvedValueOnce(null);
    (violations.fsAddViolationReport as any).mockResolvedValueOnce(undefined);
    let testRenderer: any;
    await act(async () => { testRenderer = renderer.create(<I18nProvider><CollectiveLegal /></I18nProvider>); });
    const root = testRenderer.root;
    // Translation may use key; rely on accessibilityLabel lookup via key fallback
    const submit = root.findAll((node: any) => node.props?.accessibilityLabel === 'Submit report' || node.props?.accessibilityLabel === 'advocacy.collective.submit')[0];
    expect(submit).toBeTruthy();
    await act(async () => { submit.props.onPress(); });
    expect(violations.fsAddViolationReport).toHaveBeenCalled();
  }, 15000);
});
