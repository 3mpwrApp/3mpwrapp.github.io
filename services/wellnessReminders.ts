/**
 * Wellness Reminders Service
 * 
 * Customizable notification system for wellness features
 * Supports mood check-ins, pacing breaks, medication, exercise, and more
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { logger } from '../utils/logger';

import { ensureNotificationPermission } from './notifications';

export type WellnessReminderType =
  | 'mood_checkin'
  | 'pacing_break'
  | 'medication'
  | 'exercise'
  | 'hydration'
  | 'rest_time'
  | 'symptom_log'
  | 'sleep_prep'
  | 'gratitude'
  | 'breathing';

export interface WellnessReminder {
  id: string;
  type: WellnessReminderType;
  enabled: boolean;
  title: string;
  body: string;
  schedule: 'daily' | 'interval' | 'specific_times';
  times?: string[]; // ['09:00', '14:00', '19:00'] for specific_times
  intervalMinutes?: number; // For pacing breaks
  quietHours: { start: string; end: string }; // e.g., { start: '22:00', end: '08:00' }
  adaptiveFrequency: boolean; // Reduce frequency if user is proactive
  sound: 'gentle' | 'standard' | 'none';
  vibrate: boolean;
  lastShown?: number; // Timestamp
  skipCount: number; // Track how many times user dismissed
}

const STORAGE_KEY = 'wellness:reminders:v1';
const NOTIFICATION_IDS_KEY = 'wellness:notification_ids:v1';

/**
 * Default reminder templates
 */
export const DEFAULT_REMINDERS: Omit<WellnessReminder, 'id'>[] = [
  {
    type: 'mood_checkin',
    enabled: false,
    title: '🫀 How are you feeling?',
    body: 'Take a moment to log your mood',
    schedule: 'specific_times',
    times: ['09:00', '14:00', '19:00'],
    quietHours: { start: '22:00', end: '08:00' },
    adaptiveFrequency: true,
    sound: 'gentle',
    vibrate: false,
    skipCount: 0,
  },
  {
    type: 'pacing_break',
    enabled: false,
    title: '⚖️ Time for a pacing break',
    body: 'Rest for 10 minutes to preserve your energy',
    schedule: 'interval',
    intervalMinutes: 90,
    quietHours: { start: '22:00', end: '08:00' },
    adaptiveFrequency: false,
    sound: 'gentle',
    vibrate: false,
    skipCount: 0,
  },
  {
    type: 'medication',
    enabled: false,
    title: '💊 Medication reminder',
    body: 'Time to take your medication',
    schedule: 'specific_times',
    times: ['08:00', '20:00'],
    quietHours: { start: '23:00', end: '07:00' },
    adaptiveFrequency: false,
    sound: 'standard',
    vibrate: true,
    skipCount: 0,
  },
  {
    type: 'exercise',
    enabled: false,
    title: '🏃 Movement break',
    body: 'Time for gentle movement or stretching',
    schedule: 'specific_times',
    times: ['10:00', '15:00'],
    quietHours: { start: '22:00', end: '08:00' },
    adaptiveFrequency: true,
    sound: 'gentle',
    vibrate: false,
    skipCount: 0,
  },
  {
    type: 'hydration',
    enabled: false,
    title: '💧 Stay hydrated',
    body: 'Remember to drink water',
    schedule: 'interval',
    intervalMinutes: 120,
    quietHours: { start: '22:00', end: '08:00' },
    adaptiveFrequency: true,
    sound: 'none',
    vibrate: false,
    skipCount: 0,
  },
  {
    type: 'rest_time',
    enabled: false,
    title: '😴 Rest reminder',
    body: 'Your body needs rest - take a break',
    schedule: 'specific_times',
    times: ['11:00', '14:30'],
    quietHours: { start: '22:00', end: '08:00' },
    adaptiveFrequency: true,
    sound: 'gentle',
    vibrate: false,
    skipCount: 0,
  },
  {
    type: 'symptom_log',
    enabled: false,
    title: '📊 Log your symptoms',
    body: 'Track how you\'re feeling today',
    schedule: 'specific_times',
    times: ['20:00'],
    quietHours: { start: '22:00', end: '08:00' },
    adaptiveFrequency: true,
    sound: 'gentle',
    vibrate: false,
    skipCount: 0,
  },
  {
    type: 'sleep_prep',
    enabled: false,
    title: '🌙 Prepare for sleep',
    body: 'Start your bedtime routine',
    schedule: 'specific_times',
    times: ['21:30'],
    quietHours: { start: '23:00', end: '08:00' },
    adaptiveFrequency: false,
    sound: 'gentle',
    vibrate: false,
    skipCount: 0,
  },
  {
    type: 'gratitude',
    enabled: false,
    title: '🙏 Gratitude moment',
    body: 'What are you grateful for today?',
    schedule: 'specific_times',
    times: ['19:00'],
    quietHours: { start: '22:00', end: '08:00' },
    adaptiveFrequency: true,
    sound: 'gentle',
    vibrate: false,
    skipCount: 0,
  },
  {
    type: 'breathing',
    enabled: false,
    title: '🧘 Take a breath',
    body: '1 minute breathing exercise',
    schedule: 'interval',
    intervalMinutes: 180,
    quietHours: { start: '22:00', end: '08:00' },
    adaptiveFrequency: true,
    sound: 'gentle',
    vibrate: false,
    skipCount: 0,
  },
];

/**
 * Load reminders from storage
 */
export async function getReminders(): Promise<WellnessReminder[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initialize with defaults
    const reminders = DEFAULT_REMINDERS.map((r, idx) => ({
      ...r,
      id: `reminder_${r.type}_${idx}`,
    }));
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    return reminders;
  } catch (error) {
    logger.error('Failed to load wellness reminders', error);
    return [];
  }
}

/**
 * Save reminders to storage
 */
export async function saveReminders(reminders: WellnessReminder[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    logger.error('Failed to save wellness reminders', error);
  }
}

/**
 * Update a specific reminder
 */
export async function updateReminder(
  id: string,
  updates: Partial<WellnessReminder>
): Promise<void> {
  try {
    const reminders = await getReminders();
    const index = reminders.findIndex(r => r.id === id);
    
    if (index !== -1) {
      reminders[index] = { ...reminders[index], ...updates };
      await saveReminders(reminders);
      
      // If enabled state changed, reschedule
      if ('enabled' in updates) {
        if (updates.enabled) {
          await scheduleReminder(reminders[index]);
        } else {
          await cancelReminder(id);
        }
      }
    }
  } catch (error) {
    logger.error('Failed to update wellness reminder', error);
  }
}

/**
 * Check if current time is within quiet hours
 */
function _isQuietHours(quietHours: { start: string; end: string }): boolean {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const { start, end } = quietHours;
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (start > end) {
    return currentTime >= start || currentTime < end;
  }
  
  // Handle same-day quiet hours (e.g., 12:00 to 14:00)
  return currentTime >= start && currentTime < end;
}

/**
 * Schedule notifications for a reminder
 * Platform-specific implementation
 */
async function scheduleReminder(reminder: WellnessReminder): Promise<void> {
  if (Platform.OS === 'web') {
    logger.log('Notifications not supported on web');
    return;
  }
  
  try {
    // Ensure we have permission
    const hasPermission = await ensureNotificationPermission();
    if (!hasPermission) {
      logger.log('Notification permission not granted');
      return;
    }
    
    // Lazy load expo-notifications
    const Notifications = await import('expo-notifications');
    
    // Cancel existing notifications for this reminder
    await cancelReminder(reminder.id);
    
    const notificationIds: string[] = [];
    
    if (reminder.schedule === 'specific_times' && reminder.times) {
      // Schedule for specific times each day
      for (const time of reminder.times) {
        const [hours, minutes] = time.split(':').map(Number);
        
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: reminder.body,
            sound: reminder.sound === 'none' ? undefined : (reminder.sound === 'gentle' ? 'gentle.wav' : 'default'),
            vibrate: reminder.vibrate ? [0, 250, 250, 250] : undefined,
            data: { reminderId: reminder.id, type: reminder.type },
          },
          trigger: {
            type: 'calendar' as const,
            hour: hours,
            minute: minutes,
            repeats: true,
          } as any,
        });
        
        notificationIds.push(notificationId);
      }
    } else if (reminder.schedule === 'interval' && reminder.intervalMinutes) {
      // Schedule repeating at interval
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          sound: reminder.sound === 'none' ? undefined : (reminder.sound === 'gentle' ? 'gentle.wav' : 'default'),
          vibrate: reminder.vibrate ? [0, 250, 250, 250] : undefined,
          data: { reminderId: reminder.id, type: reminder.type },
        },
        trigger: {
          type: 'timeInterval' as const,
          seconds: reminder.intervalMinutes * 60,
          repeats: true,
        } as any,
      });
      
      notificationIds.push(notificationId);
    }
    
    // Store notification IDs for later cancellation
    const storedIds = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    const idsMap = storedIds ? JSON.parse(storedIds) : {};
    idsMap[reminder.id] = notificationIds;
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(idsMap));
    
    logger.log(`Scheduled ${notificationIds.length} notifications for ${reminder.type}`);
  } catch (error) {
    logger.error('Failed to schedule wellness reminder', error);
  }
}

/**
 * Cancel notifications for a reminder
 */
async function cancelReminder(reminderId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  
  try {
    const Notifications = await import('expo-notifications');
    
    // Get stored notification IDs
    const storedIds = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (!storedIds) return;
    
    const idsMap = JSON.parse(storedIds);
    const notificationIds = idsMap[reminderId];
    
    if (notificationIds && Array.isArray(notificationIds)) {
      for (const id of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      
      delete idsMap[reminderId];
      await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(idsMap));
      
      logger.log(`Cancelled ${notificationIds.length} notifications for ${reminderId}`);
    }
  } catch (error) {
    logger.error('Failed to cancel wellness reminder', error);
  }
}

/**
 * Schedule all enabled reminders
 */
export async function scheduleAllReminders(): Promise<void> {
  try {
    const reminders = await getReminders();
    const enabled = reminders.filter(r => r.enabled);
    
    for (const reminder of enabled) {
      await scheduleReminder(reminder);
    }
    
    logger.log(`Scheduled ${enabled.length} wellness reminders`);
  } catch (error) {
    logger.error('Failed to schedule all wellness reminders', error);
  }
}

/**
 * Cancel all reminders
 */
export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
    logger.log('Cancelled all wellness reminders');
  } catch (error) {
    logger.error('Failed to cancel all wellness reminders', error);
  }
}

/**
 * Get reminders by type
 */
export async function getRemindersByType(type: WellnessReminderType): Promise<WellnessReminder[]> {
  const reminders = await getReminders();
  return reminders.filter(r => r.type === type);
}

/**
 * Quick enable/disable for a reminder type
 */
export async function toggleReminderType(type: WellnessReminderType, enabled: boolean): Promise<void> {
  const reminders = await getReminders();
  const updated = reminders.map(r => 
    r.type === type ? { ...r, enabled } : r
  );
  
  await saveReminders(updated);
  
  // Reschedule if enabled, cancel if disabled
  for (const reminder of updated) {
    if (reminder.type === type) {
      if (enabled) {
        await scheduleReminder(reminder);
      } else {
        await cancelReminder(reminder.id);
      }
    }
  }
}

/**
 * React hook for managing wellness reminders
 */

export function useWellnessReminders() {
  const [reminders, setReminders] = useState<WellnessReminder[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadReminders();
  }, []);
  
  const loadReminders = async () => {
    setLoading(true);
    const data = await getReminders();
    setReminders(data);
    setLoading(false);
  };
  
  const updateReminderSettings = async (id: string, updates: Partial<WellnessReminder>) => {
    await updateReminder(id, updates);
    await loadReminders();
  };
  
  const toggleReminder = async (id: string, enabled: boolean) => {
    await updateReminder(id, { enabled });
    await loadReminders();
  };
  
  return {
    reminders,
    loading,
    updateReminderSettings,
    toggleReminder,
    refresh: loadReminders,
  };
}
