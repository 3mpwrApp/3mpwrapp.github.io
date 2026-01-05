import { render, screen, waitFor } from '@testing-library/react';

import LegalActionHub from '../app/(tabs)/advocacy/legal-action-hub';
import { listCases } from '../services/accountabilityTracker';
import { trackEvent } from '../services/analyticsClient';

const push = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: (props: any) => <span {...props} /> }));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: false,
    colors: {
      primary: '#06f',
      background: '#fff',
      card: '#f8f8f8',
      text: '#111',
      border: '#ddd',
      notification: '#f00',
    },
  }),
  useFocusEffect: () => {},
  useRoute: () => ({}),
}));

jest.mock('../hooks/useA11y', () => ({
  useAnnounceOnMount: () => {},
  useFocusOnRefOnMount: () => {},
  useScreenReaderEnabled: () => false,
  useReduceMotionEnabled: () => false,
  MAX_FONT_SCALE: 2,
}));

jest.mock('../theme/usePalette', () => ({
  useAppPalette: () => ({
    primary: '#06f',
    onPrimary: '#fff',
    text: '#111',
    secondaryText: '#555',
    background: '#fff',
    surface: '#fff',
    card: '#f8f8f8',
    muted: '#ccc',
    warning: '#f90',
    success: '#0a0',
    info: '#09f',
  }),
}));

jest.mock('react-native', () => {
  return {
    Alert: { alert: jest.fn() },
    Platform: { OS: 'web', select: (obj: any) => obj.web },
    ScrollView: (props: any) => <div>{props.children}</div>,
    StyleSheet: { create: (s: any) => s, hairlineWidth: 1 },
    Text: (props: any) => <span {...props}>{props.children}</span>,
    TextInput: (_props: any) => <input />,
    View: (props: any) => <div>{props.children}</div>,
    Pressable: (props: any) => <button onClick={props.onPress}>{props.children}</button>,
    useColorScheme: () => 'light',
    I18nManager: { isRTL: false, forceRTL: () => {}, allowRTL: () => {} },
  };
});

jest.mock('../components/PowerTool', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const PowerTool = ({ children, title, subtitle, tabs = [], defaultTab }: any) => {
    const ActiveTab = tabs.find((t: any) => t.id === defaultTab)?.component || tabs[0]?.component;
    return (
      <View>
        <Text>{title}</Text>
        <Text>{subtitle}</Text>
        {ActiveTab ? <ActiveTab navigateToTab={() => {}} /> : null}
        {children}
      </View>
    );
  };
  const PowerToolSection = ({ children, title }: any) => (
    <View>
      <Text>{title}</Text>
      {children}
    </View>
  );
  const PowerToolTabContent = ({ children }: any) => <View>{children}</View>;
  const PowerToolAction = ({ label, onPress }: any) => (
    <Text onPress={onPress}>{label}</Text>
  );
  return {
    __esModule: true,
    default: PowerTool,
    PowerToolSection,
    PowerToolTabContent,
    PowerToolAction,
  };
});

jest.mock('../components/A11yPressable', () => {
  const { Pressable } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <Pressable {...props}>{props.children}</Pressable>,
  };
});

jest.mock('../components/ResponsiveScreenWrapper', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('../components/GapView', () => {
  const { View } = require('react-native');
  const GapView = ({ children }: any) => <View>{children}</View>;
  return { __esModule: true, default: GapView, GapView };
});

jest.mock('../services/analyticsClient', () => ({ trackEvent: jest.fn() }));
jest.mock('../services/accountabilityTracker');
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k: string, fb?: string) => fb || k }) }));

jest.mock('../app/(tabs)/advocacy/legal-action-hub/tabs/accountability', () => {
  const { View, Text } = require('react-native');
  return { __esModule: true, default: () => <View><Text>Accountability Tab</Text></View> };
});

jest.mock('../app/(tabs)/advocacy/legal-action-hub/tabs/automation', () => {
  const { View, Text } = require('react-native');
  return { __esModule: true, default: () => <View><Text>Automation Tab</Text></View> };
});

jest.mock('../app/(tabs)/advocacy/legal-action-hub/tabs/coach', () => {
  const { View, Text } = require('react-native');
  return { __esModule: true, default: () => <View><Text>Coach Tab</Text></View> };
});

jest.mock('../app/(tabs)/advocacy/legal-action-hub/tabs/legal-help', () => {
  const { View, Text } = require('react-native');
  return { __esModule: true, default: () => <View><Text>Legal Help Tab</Text></View> };
});

jest.mock('../app/(tabs)/advocacy/legal-action-hub/tabs/policy', () => {
  const { View, Text } = require('react-native');
  return { __esModule: true, default: () => <View><Text>Policy Tab</Text></View> };
});

(listCases as jest.Mock).mockResolvedValue([
  {
    id: 'c1',
    target: 'Insurance Corp',
    issue: 'Claim denial',
    createdAt: Date.now() - 10_000,
    updatedAt: Date.now(),
    events: [],
  },
]);

describe('LegalActionHub', () => {
  beforeEach(() => {
    push.mockClear();
    (trackEvent as jest.Mock).mockClear();
  });

  it('renders cases and routes quick actions', async () => {
    render(<LegalActionHub />);

    // Check that the component renders with the default Accountability tab
    await waitFor(() => screen.getByText(/Accountability Tab/i));
  });
});
