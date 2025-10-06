import { act, render } from '@testing-library/react';
import React from 'react';

import { NotificationsProvider, useNotifications } from '../store/notifications';

function Harness() {
  const { inbox, unread, add, markRead, markAllRead, prefs, updatePrefs, lastSent, setLastSent } = useNotifications();
  // expose to window for assertions (simple pattern to avoid breaking hook rules)
  (global as any).__inbox = inbox;
  (global as any).__unread = unread;
  (global as any).__prefs = prefs;
  (global as any).__lastSent = lastSent;
  (global as any).__api = { add, markRead, markAllRead, updatePrefs, setLastSent };
  return null;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <NotificationsProvider>{children}</NotificationsProvider>;
}

describe('notifications store', () => {
  it('adds notifications and enforces inbox cap', () => {
    render(<Wrapper><Harness /></Wrapper>);
    const { add } = (global as any).__api;
    const now = Date.now();
    const many = Array.from({ length: 120 }).map((_, i) => ({
      id: `n${i}`,
      templateId: 't',
      createdAt: now + i,
      read: false,
      title: 't',
      body: 'b',
      payloadHash: 'x',
      event: 'e',
      channel: 'inApp' as const,
    }));
    act(() => { add(many); });
    const inbox = (global as any).__inbox as any[];
    expect(inbox.length).toBeLessThanOrEqual(100);
    // newest kept first
    expect(inbox[0].id).toBe('n119');
  });

  it('marks single notification read and all read', () => {
    render(<Wrapper><Harness /></Wrapper>);
    const { add, markRead, markAllRead } = (global as any).__api;
    const base = (t: number, id: string) => ({ id, templateId: 't', createdAt: t, read: false, title: 't', body: 'b', payloadHash: 'x', event: 'e', channel: 'inApp' as const });
    act(() => { add([base(1, 'a'), base(2, 'b')]); });
    expect((global as any).__unread).toBe(2);
    act(() => { markRead('a'); });
    expect((global as any).__unread).toBe(1);
    act(() => { markAllRead(); });
    expect((global as any).__unread).toBe(0);
  });

  it('updates preferences and lastSent timestamps', () => {
    render(<Wrapper><Harness /></Wrapper>);
    const { updatePrefs, setLastSent } = (global as any).__api;
    act(() => { updatePrefs((p: any) => ({ ...p, channels: { ...p.channels, push: false } })); });
    expect((global as any).__prefs.channels.push).toBe(false);
    act(() => { setLastSent('coach-result-ready', 123); });
    expect((global as any).__lastSent['coach-result-ready']).toBe(123);
  });
});
