import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Event } from '../data/events';

import * as Notifier from './notifications';

const KEY_PREFIX = 'eventReminder:'; // eventReminder:<id>

export async function isScheduled(eventId: string) {
  try { return !!(await AsyncStorage.getItem(KEY_PREFIX + eventId)); } catch { return false; }
}

export async function clearAll() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const evKeys = keys.filter(k => k.startsWith(KEY_PREFIX));
    if (evKeys.length) {
      const values = await AsyncStorage.multiGet(evKeys);
      for (const [,v] of values) {
        if (v) {
          try {
            const parsed = JSON.parse(v);
            if (parsed?.notifId) await Notifier.cancel(parsed.notifId);
          } catch {}
        }
      }
      await AsyncStorage.multiRemove(evKeys);
    }
  } catch {}
}

export async function scheduleForEvent(evt: Event, minutesBefore = 60) {
  // Parse date (expects 'YYYY-MM-DD HH:MM' or ISO)
  let dt = new Date(evt.date.includes('T') ? evt.date : evt.date.replace(' ', 'T'));
  if (isNaN(dt.getTime())) return { ok:false, reason:'invalid-date' } as const;
  const trigger = new Date(dt.getTime() - minutesBefore * 60 * 1000);
  if (trigger.getTime() <= Date.now() + 2 * 60 * 1000) {
    // require at least 2 minutes lead
    return { ok:false, reason:'too-soon' } as const;
  }
  const notifId = await Notifier.scheduleAt(trigger, evt.title, evt.description || '');
  if (!notifId) return { ok:false, reason:'schedule-failed' } as const;
  try { await AsyncStorage.setItem(KEY_PREFIX + evt.id, JSON.stringify({ at: trigger.toISOString(), notifId })); } catch {}
  return { ok:true } as const;
}

export async function removeReminder(eventId: string) {
  try {
    const raw = await AsyncStorage.getItem(KEY_PREFIX + eventId);
    if (raw) {
      try { const parsed = JSON.parse(raw); if (parsed?.notifId) await Notifier.cancel(parsed.notifId); } catch {}
    }
    await AsyncStorage.removeItem(KEY_PREFIX + eventId);
  } catch {}
}
