import { act, render } from '@testing-library/react';
import React from 'react';

import { useNotificationDispatcher } from '../services/notifications.dispatcher';
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
});
