import { useEffect } from 'react';

import { useCoachProgress } from '../store/coachProgress';

import { useNotificationDispatcher } from './notifications.dispatcher';

// Simple inactivity reminder: if no lesson completed in thresholdMs schedule reminder notification.
const THRESHOLD_MS = 72 * 60 * 60 * 1000; // 72h

let timeout: any;

export function useCoachInactivityReminder() {
  const { lessons } = useCoachProgress();
  const { dispatchDomainEvent } = useNotificationDispatcher();
  useEffect(() => {
    if (timeout) clearTimeout(timeout);
    const latest = lessons.reduce((acc, l) => Math.max(acc, l.completedAt || l.firstViewed), 0);
    const delta = Date.now() - latest;
    if (!latest || delta >= THRESHOLD_MS) {
      // Immediately queue if already idle
      dispatchDomainEvent({ event:'coach.reminder', payload:{ idleHours: Math.round(delta/3600000) } }).catch(()=>{});
    } else {
      const wait = THRESHOLD_MS - delta;
      timeout = setTimeout(() => {
        dispatchDomainEvent({ event:'coach.reminder', payload:{ idleHours: Math.round(THRESHOLD_MS/3600000) } }).catch(()=>{});
      }, wait);
      try { (timeout as any)?.unref?.(); } catch {}
    }
    return () => { if (timeout) clearTimeout(timeout); };
  }, [lessons.map(l=>l.completedAt).join('|')]);
}
