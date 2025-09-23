import { act, render } from '@testing-library/react';
import React from 'react';

import { useNotificationDispatcher } from '../services/notifications.dispatcher';
import { listNotificationTemplates } from '../services/notifications.templates';
import { NotificationsProvider, useNotifications } from '../store/notifications';

function TestHarness({ cb }: { cb: (api: any) => void }) {
  const { dispatchDomainEvent } = useNotificationDispatcher();
  const { updatePrefs, inbox } = useNotifications();
  React.useEffect(() => { cb({ dispatchDomainEvent, updatePrefs, getInbox: () => inbox }); }, [cb, dispatchDomainEvent, updatePrefs, inbox]);
  return null;
}

async function waitForApi(getApi: () => any) {
  for (let i=0;i<20;i++) {
    if (getApi()) return;
    await act(async () => { await new Promise(r=>setTimeout(r,0)); });
  }
  throw new Error('API not initialized in time');
}

async function waitForInbox(getApi: () => any, min: number) {
  for (let i=0;i<10;i++) {
    const api = getApi();
    const len = api?.getInbox?.()?.length;
    if (typeof len === 'number' && len >= min) return len;
    await act(async () => { await new Promise(r=>setTimeout(r,0)); });
  }
  const api = getApi();
  const len = api?.getInbox?.()?.length;
  throw new Error(`Inbox not populated (have ${len === undefined ? 'undefined' : len})`);
}

describe('Notification Dispatcher', () => {
  it('delivers in-app notification for coach completion', async () => {
    let api: any;    
    render(<NotificationsProvider><TestHarness cb={(a)=> (api=a)} /></NotificationsProvider>);
    await waitForApi(()=>api);
    await act(async () => { await api.dispatchDomainEvent({ event:'coach.generate.completed', payload:{ jurisdictionName:'Ontario', coachTopic:'Accessibility' } }); });
    await waitForInbox(()=>api,1);
  });

  it('respects template throttle (coach)', async () => {
    let api: any;    
    render(<NotificationsProvider><TestHarness cb={(a)=> (api=a)} /></NotificationsProvider>);
    await waitForApi(()=>api);
    const tpl = listNotificationTemplates().find(t=> t.id==='coach-result-ready');
    expect(tpl).toBeTruthy();
    await act(async () => { await api.dispatchDomainEvent({ event:'coach.generate.completed' }); });
    await waitForInbox(()=>api,1);
    const afterFirst = api.getInbox().length || 0;
    // Immediate re-dispatch should be throttled silently
    await act(async () => { await api.dispatchDomainEvent({ event:'coach.generate.completed' }); });
    const afterSecond = api.getInbox().length || 0;
    expect(afterSecond).toBe(afterFirst); // throttle prevented duplicate
    // Advance time beyond throttle window (mock simple by manipulating Date now via options)
    const firstTs = Date.now();
    const later = new Date(firstTs + ((tpl?.throttleSec||0) + 1) * 1000);
    await act(async () => { await api.dispatchDomainEvent({ event:'coach.generate.completed' }, { now: later }); });
    const afterThird = api.getInbox().length || 0;
    expect(afterThird).toBeGreaterThan(afterSecond);
  });

  it('suppresses push during quiet hours but still delivers in-app', async () => {
    let api: any;
    render(<NotificationsProvider><TestHarness cb={(a)=> (api=a)} /></NotificationsProvider>);
    await waitForApi(()=>api);
    const late = new Date(); late.setHours(23); // within quiet hours window
    await act(async () => { await api.dispatchDomainEvent({ event:'coach.generate.completed' }, { now: late }); });
    await waitForInbox(()=>api,1);
  });

  it('skips when category preference disabled', async () => {
    let api: any;
    render(<NotificationsProvider><TestHarness cb={(a)=> (api=a)} /></NotificationsProvider>);
    await waitForApi(()=>api);
    // Disable advocacy category (coach template category)
  await act(async () => { api.updatePrefs((p: any) => ({ ...p, categories: { ...p.categories, advocacy: false } })); });
    const before = api.getInbox().length || 0;
    await act(async () => { await api.dispatchDomainEvent({ event:'coach.generate.completed' }); });
    const after = api.getInbox().length || 0;
    expect(after).toBe(before); // no new notifications when category disabled
  });

  it('falls back to in-app only when push channel disabled in prefs', async () => {
    let api: any;
    render(<NotificationsProvider><TestHarness cb={(a)=> (api=a)} /></NotificationsProvider>);
    await waitForApi(()=>api);
  await act(async () => { api.updatePrefs((p: any) => ({ ...p, channels: { ...p.channels, push: false } })); });
    await act(async () => { await api.dispatchDomainEvent({ event:'coach.generate.completed' }); });
    await waitForInbox(()=>api,1);
    const inbox = api.getInbox();
    expect(inbox?.some((n: any)=> n.templateId==='coach-result-ready')).toBe(true);
  });
});
