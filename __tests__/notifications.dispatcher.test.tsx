import { act, render } from '@testing-library/react';
import React from 'react';

// Mocks to neutralize native/expo runtime side-effects (HMR websockets, permissions APIs)
jest.mock('expo', () => ({
  // minimal surface required; avoid HMRClient usage
}));
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: async () => ({ status: 'granted' }),
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  scheduleNotificationAsync: async () => 'local-id-1',
  setNotificationHandler: () => {},
  AndroidImportance: { MAX: 5 },
  AndroidNotificationVisibility: { PUBLIC: 1 },
  setNotificationChannelAsync: async () => {},
}));

import { useNotificationDispatcher } from '../services/notificationsDispatcher';
import { NotificationsProvider, useNotifications } from '../store/notifications';

// Mock i18n to avoid needing a provider; return the fallback or the key
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k: string, fallback?: string) => fallback ?? k }) }));

type API = {
  dispatch: (evt: any, opts?: any) => Promise<void>;
  updatePrefs: (fn: (p: any) => any) => void;
  getInbox: () => any[];
};

const Harness = React.forwardRef<API, {}>(function Harness(_props, ref) {
  const { inbox, updatePrefs } = useNotifications();
  const { dispatchDomainEvent } = useNotificationDispatcher();
  React.useImperativeHandle(ref, () => ({
    dispatch: dispatchDomainEvent,
    updatePrefs,
    getInbox: () => inbox,
  }), [inbox, updatePrefs, dispatchDomainEvent]);
  return null;
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <NotificationsProvider>{children}</NotificationsProvider>;
}

describe('notifications dispatcher', () => {
  it('delivers in-app even during quiet hours', async () => {
    const ref = React.createRef<API>();
    render(<Wrapper><Harness ref={ref} /></Wrapper>);
    // Ensure channels enabled
    act(() => { ref.current!.updatePrefs((p) => ({ ...p, channels: { ...p.channels, inapp: true, push: true } })); });
    const late = new Date(); late.setHours(23,0,0,0);
    await act(async () => { await ref.current!.dispatch({ event: 'coach.generate.completed', payload: {} }, { now: late }); });
    expect(ref.current!.getInbox().length).toBe(1);
  });

  it('throttles duplicates within window', async () => {
    const ref = React.createRef<API>();
    render(<Wrapper><Harness ref={ref} /></Wrapper>);
    const t0 = new Date(); t0.setHours(12,0,0,0);
    await act(async () => { await ref.current!.dispatch({ event: 'coach.generate.completed', payload: {} }, { now: t0 }); });
    await act(async () => { await ref.current!.dispatch({ event: 'coach.generate.completed', payload: {} }, { now: new Date(t0.getTime() + 60 * 1000) }); });
    expect(ref.current!.getInbox().length).toBe(1);
  });

  it('emits quiet suppression analytics when in quiet hours', async () => {
    const ref = React.createRef<API>();
    const { unmount } = render(<Wrapper><Harness ref={ref} /></Wrapper>);
    // Force prefs push/inapp enabled
    act(() => { ref.current!.updatePrefs((p) => ({ ...p, channels: { ...p.channels, push: true, inapp: true } })); });
    const late = new Date(); late.setHours(23,15,0,0);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(()=>{});
    await act(async () => { await ref.current!.dispatch({ event: 'coach.generate.completed', payload: {} }, { now: late }); });
    // Expect one delivered in-app notification
    expect(ref.current!.getInbox().length).toBe(1);
    // Find quiet_suppressed analytics log in captured warnings
    const hasQuiet = warnSpy.mock.calls.some(c => typeof c[0] === 'string' && /notification.quiet_suppressed/.test(c[0]) || (c[0] && /notification.quiet_suppressed/.test(JSON.stringify(c))));
    expect(hasQuiet).toBeTruthy();
    warnSpy.mockRestore();
    unmount();
  });
});
