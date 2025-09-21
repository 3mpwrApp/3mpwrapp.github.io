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
    if (evKeys.length) await AsyncStorage.multiRemove(evKeys);
  } catch {}
}

export async function scheduleForEvent(evt: Event, minutesBefore = 60) {
  // Parse date (expects 'YYYY-MM-DD HH:MM' or ISO)
  let dt = new Date(evt.date.includes('T') ? evt.date : evt.date.replace(' ', 'T'));
  if (isNaN(dt.getTime())) return { ok:false, reason:'invalid-date' };
  const trigger = new Date(dt.getTime() - minutesBefore * 60 * 1000);
  if (trigger.getTime() <= Date.now() + 2 * 60 * 1000) {
    // require at least 2 minutes lead
    return { ok:false, reason:'too-soon' };
  }
  const scheduled = await Notifier.scheduleAt(trigger, evt.title, evt.description || '');
  if (!scheduled) return { ok:false, reason:'schedule-failed' };
  try { await AsyncStorage.setItem(KEY_PREFIX + evt.id, JSON.stringify({ at: trigger.toISOString() })); } catch {}
  return { ok:true };
}

export async function removeReminder(eventId: string) {
  try { await AsyncStorage.removeItem(KEY_PREFIX + eventId); } catch {}
}
