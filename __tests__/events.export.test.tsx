import { fireEvent, render, screen } from '@testing-library/react';

import EventsScreen from '../app/events';
// Mock expo-router Link to avoid bringing in native stack/assets
jest.mock('expo-router', () => ({ 
  Link: ({ children }: any) => children, 
  usePathname: () => '/', 
  useLocalSearchParams: () => ({}),
  useFocusEffect: (callback: any) => {
    const React = require('react');
    React.useEffect(() => {
      const cleanup = callback();
      return cleanup;
    }, [callback]);
  }
}));

// Mocks: translation/palette/typography
jest.mock('../i18n', () => {
  const real = jest.requireActual('../i18n');
  return { __esModule: true, ...real, I18nProvider: real.I18nProvider, useTranslation: () => ({ t: (k:string, f?:string, opts?:any)=> (opts?.n ? String(opts.n) : (f||k)) }) };
});
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#000', background:'#fff', card:'#fff', surface:'#fff', muted:'#ccc', primary:'#06f', onPrimary:'#fff' }) }));
jest.mock('../theme/typography', () => ({ useTextScale: () => ({ factor:1 }) }));
// Mock native stack/elements to avoid asset imports via expo-router internals
jest.mock('@react-navigation/native-stack', () => ({}));
jest.mock('@react-navigation/elements', () => ({}));
// Mock vector icons to avoid expo-modules-core EventEmitter
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
// Mock UI chrome that uses style functions/arrays heavily
jest.mock('../components/SettingsLink', () => () => null);
jest.mock('../components/ContrastToggle', () => () => null);

// Silence network
jest.mock('../services/events', () => ({ fetchEvents: async () => [] }));
jest.mock('../services/firestore', () => ({ fsAddEvent: async () => true }));
jest.mock('../services/firestoreEventSync', () => ({ 
  syncEventToProduction: async () => true, 
  deleteEventFromProduction: async () => true,
  isFirestoreSyncAvailable: async () => true
}));
jest.mock('../services/eventAutoSync', () => ({ 
  addToSyncQueue: async () => {},
  removeFromSyncQueue: async () => {},
  getSyncQueue: async () => [],
  getSyncQueueStats: async () => ({ total: 0, pending: 0, failed: 0, oldestPending: null }),
  processSyncQueue: async () => ({ synced: 0, failed: 0, pending: 0 }),
  startBackgroundSync: () => () => {},
  clearSyncQueue: async () => {}
}));

// Silence analytics native
jest.mock('../services/analytics', () => ({ logEvent: () => {} }));
// Mock counts hook to avoid provider wiring in this isolated test
jest.mock('../store/counts', () => ({ useCounts: () => ({ counts: {}, setCount: jest.fn() }) }));
// Mock network hook
jest.mock('../store/network', () => ({ useNetwork: () => ({ offline: false, setOffline: jest.fn() }) }));
jest.mock('../store/refresh', () => ({ useRefresh: () => ({ tick: 0, refreshAll: jest.fn() }) }));
// Mock auth hook to avoid provider wiring
jest.mock('../context/AuthContext', () => ({ 
  useAuth: () => ({ 
    user: { uid: 'test-user-123', email: 'test@example.com' }, 
    isAdmin: false,
    loading: false 
  }),
  AuthProvider: ({ children }: any) => children
}));
// Mock settings hook used inside Card but preserve provider for TestProviders
jest.mock('../store/settings', () => {
  const real = jest.requireActual('../store/settings');
  return { __esModule: true, ...real, SettingsProvider: real.SettingsProvider, useSettings: () => ({ dyslexiaFriendly: false, includeProvincialHolidays: false, province: 'ON', highContrast: false, textScale: 'normal', plainLanguage: false, captionsPreferred: true, resourcePreferredFormat: 'text', youtubeOpenPreference: 'ask', voiceMode: false, screenReaderOptimized: false, reduceMotion: false, focusIndicatorEnhanced: false, tapTargetMinimum: true, notificationsEnabled: true, notificationSound: true, notificationVibration: true, emergencyAlerts: true, wellnessReminders: false, eventReminders: false, requirePasscodeOnLaunch: false, autoLockTimeout: 5, analyticsOptOut: false, moodNudgesEnabled: true, quietHoursEnabled: true, quietHoursStart: '22:00', quietHoursEnd: '07:00' }) };
});

describe('Events export actions', () => {
  it('creates an event and verifies action buttons exist', async () => {
    render(<EventsScreen />);
    
    // Open create event form
    const toggle = await screen.findByText(/Create Event|Close Form/i);
    // @ts-ignore react-native testing library press alias
    fireEvent.press(toggle);
    
    // Fill out the form
    const title = screen.getByPlaceholderText(/Event Name/i);
    const desc = screen.getByPlaceholderText(/Description/i);
    const date = screen.getByPlaceholderText(/Date.*YYYY-MM-DD/i);
    const add = screen.getByText(/Add Event/i);
    fireEvent.change(title as any, { target: { value: 'Test Event' } });
    fireEvent.change(desc as any, { target: { value: 'Test Description' } });
    fireEvent.change(date as any, { target: { value: '2025-10-01' } });
    
    // @ts-ignore
    fireEvent.press(add);

    // Verify event was created - look for action buttons from EventActionsBar
    // The new UI uses EventActionsBar with share, social, and calendar buttons on each event
    const shareButtons = await screen.findAllByText(/📤 Share/);
    expect(shareButtons.length).toBeGreaterThan(0);
    
    // We should also have social and calendar buttons (findAllBy since multiple events)
    const socialsButtons = await screen.findAllByText(/🌐 Socials/);
    const calendarButtons = await screen.findAllByText(/📅 Add to Calendar/);
    expect(socialsButtons.length).toBeGreaterThan(0);
    expect(calendarButtons.length).toBeGreaterThan(0);
    
    // Verify the action buttons are present and properly rendered
    // This confirms the new EventActionsBar component is working correctly
    expect(shareButtons[0]).toBeTruthy();
    expect(socialsButtons[0]).toBeTruthy();
    expect(calendarButtons[0]).toBeTruthy();
  }, 30000);
});
