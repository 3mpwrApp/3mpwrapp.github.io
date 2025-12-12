/**
 * Push Notification Triggers
 * 
 * Automated notification scheduling based on user behavior and app events.
 * Implements the push notification strategy from PUSH_NOTIFICATION_STRATEGY.md
 */

import { logError } from '../utils/errorLogger';

import { trackNotificationSent } from './analyticsTracking';
import { getNotificationSchedule, isNotificationEnabled, type NotificationCategory } from './notificationPreferences';
import { cancel, scheduleAt, scheduleDailyAt, scheduleLocal } from './notifications';

// Storage keys for notification IDs
const NOTIFICATION_IDS_KEY = 'scheduled_notification_ids:v1';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

// ============================================
// NOTIFICATION STORAGE HELPERS
// ============================================

async function storeNotificationId(category: string, id: string) {
  if (!AsyncStorage) return;
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    const ids = stored ? JSON.parse(stored) : {};
    ids[category] = ids[category] || [];
    ids[category].push(id);
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
  } catch (e) {
    logError('NotificationTriggers', 'Failed to store notification ID', e as Error);
  }
}

async function getStoredNotificationIds(category: string): Promise<string[]> {
  if (!AsyncStorage) return [];
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    const ids = stored ? JSON.parse(stored) : {};
    return ids[category] || [];
  } catch {
    return [];
  }
}

async function clearStoredNotificationIds(category: string) {
  if (!AsyncStorage) return;
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    const ids = stored ? JSON.parse(stored) : {};
    delete ids[category];
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
  } catch {
    // Silent fail
  }
}

// ============================================
// WELLNESS REMINDERS
// ============================================

/**
 * Schedule daily wellness check-in reminder
 */
export async function scheduleWellnessReminder() {
  const enabled = await isNotificationEnabled('wellness');
  if (!enabled) return null;
  
  // Cancel existing wellness reminders
  await cancelWellnessReminders();
  
  const schedule = await getNotificationSchedule('wellness');
  const hour = schedule?.hour ?? 9;
  const minute = schedule?.minute ?? 0;
  
  const id = await scheduleDailyAt(
    hour,
    minute,
    '💚 Daily Check-In',
    'How are you feeling today? Take a moment to log your mood and energy.'
  );
  
  if (id) {
    await storeNotificationId('wellness', id);
    trackNotificationSent('wellness', 'daily_checkin');
  }
  
  return id;
}

export async function cancelWellnessReminders() {
  const ids = await getStoredNotificationIds('wellness');
  for (const id of ids) {
    await cancel(id);
  }
  await clearStoredNotificationIds('wellness');
}

// ============================================
// MEDICATION REMINDERS
// ============================================

/**
 * Schedule medication reminder at specific times
 */
export async function scheduleMedicationReminder(
  medName: string,
  hour: number,
  minute: number,
  medicationId: string
) {
  const enabled = await isNotificationEnabled('medication');
  if (!enabled) return null;
  
  const id = await scheduleDailyAt(
    hour,
    minute,
    '💊 Medication Reminder',
    `Time to take your ${medName}`
  );
  
  if (id) {
    await storeNotificationId(`medication:${medicationId}`, id);
    trackNotificationSent('medication', 'reminder');
  }
  
  return id;
}

export async function cancelMedicationReminder(medicationId: string) {
  const ids = await getStoredNotificationIds(`medication:${medicationId}`);
  for (const id of ids) {
    await cancel(id);
  }
  await clearStoredNotificationIds(`medication:${medicationId}`);
}

// ============================================
// DEADLINE REMINDERS
// ============================================

/**
 * Schedule reminder for upcoming deadline
 */
export async function scheduleDeadlineReminder(
  deadlineId: string,
  title: string,
  dueDate: Date,
  daysBeforeReminders: number[] = [7, 3, 1]
) {
  const enabled = await isNotificationEnabled('deadlines');
  if (!enabled) return [];
  
  const scheduledIds: string[] = [];
  const now = new Date();
  
  for (const daysBefore of daysBeforeReminders) {
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);
    reminderDate.setHours(9, 0, 0, 0);
    
    if (reminderDate > now) {
      const id = await scheduleAt(
        reminderDate,
        `⏰ Deadline Approaching`,
        daysBefore === 1 
          ? `Tomorrow: ${title}`
          : `${daysBefore} days until: ${title}`
      );
      
      if (id) {
        scheduledIds.push(id);
        await storeNotificationId(`deadline:${deadlineId}`, id);
      }
    }
  }
  
  if (scheduledIds.length > 0) {
    trackNotificationSent('deadline', 'scheduled');
  }
  
  return scheduledIds;
}

export async function cancelDeadlineReminders(deadlineId: string) {
  const ids = await getStoredNotificationIds(`deadline:${deadlineId}`);
  for (const id of ids) {
    await cancel(id);
  }
  await clearStoredNotificationIds(`deadline:${deadlineId}`);
}

// ============================================
// STREAK & ENGAGEMENT
// ============================================

/**
 * Send streak celebration notification
 */
export async function sendStreakCelebration(streakDays: number) {
  const enabled = await isNotificationEnabled('achievements');
  if (!enabled) return null;
  
  let message = '';
  let emoji = '🔥';
  
  if (streakDays === 3) {
    message = "You've logged 3 days in a row! Keep building that habit.";
    emoji = '🌟';
  } else if (streakDays === 7) {
    message = 'One week streak! Your consistency is inspiring.';
    emoji = '🏆';
  } else if (streakDays === 30) {
    message = '30 days! You are unstoppable.';
    emoji = '👑';
  } else if (streakDays % 10 === 0) {
    message = `${streakDays} days of wellness tracking! Amazing dedication.`;
    emoji = '💪';
  } else {
    return null; // Only celebrate milestones
  }
  
  const id = await scheduleLocal(`${emoji} Streak Milestone!`, message);
  
  if (id) {
    trackNotificationSent('achievement', 'streak_milestone');
  }
  
  return id;
}

/**
 * Send gentle re-engagement reminder after inactivity
 */
export async function scheduleReengagementReminder(lastActiveDate: Date) {
  const enabled = await isNotificationEnabled('community');
  if (!enabled) return null;
  
  const now = new Date();
  const daysSinceActive = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceActive < 3) return null; // Don't remind active users
  
  // Cancel any existing re-engagement reminders
  const existingIds = await getStoredNotificationIds('reengagement');
  for (const id of existingIds) {
    await cancel(id);
  }
  await clearStoredNotificationIds('reengagement');
  
  // Schedule reminder for tomorrow at 10am
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + 1);
  reminderDate.setHours(10, 0, 0, 0);
  
  const id = await scheduleAt(
    reminderDate,
    '💭 We Miss You!',
    'Your wellness journey is waiting. Even 1 minute of tracking helps.'
  );
  
  if (id) {
    await storeNotificationId('reengagement', id);
    trackNotificationSent('reengagement', 'gentle_reminder');
  }
  
  return id;
}

// ============================================
// EVENT & CAMPAIGN NOTIFICATIONS
// ============================================

/**
 * Send local notification for new community content
 */
export async function notifyNewCommunityContent(type: 'event' | 'campaign', title: string) {
  const category: NotificationCategory = type === 'event' ? 'events' : 'campaigns';
  const enabled = await isNotificationEnabled(category);
  if (!enabled) return null;
  
  const emoji = type === 'event' ? '📅' : '📢';
  const heading = type === 'event' ? 'New Event!' : 'New Campaign!';
  
  const id = await scheduleLocal(`${emoji} ${heading}`, title);
  
  if (id) {
    trackNotificationSent(type, 'new_content');
  }
  
  return id;
}

// ============================================
// SMART NOTIFICATION SETUP
// ============================================

/**
 * Initialize all scheduled notifications based on user preferences
 * Call this at app startup and when preferences change
 */
export async function initializeScheduledNotifications() {
  try {
    // Schedule wellness daily reminder if enabled
    await scheduleWellnessReminder();
    
    // Re-engagement will be handled based on activity tracking
    // Deadlines are scheduled individually when created
    // Medications are scheduled individually when added
    
    return true;
  } catch (e) {
    logError('NotificationTriggers', 'Failed to initialize notifications', e as Error);
    return false;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications() {
  try {
    await cancelWellnessReminders();
    
    // Clear all stored IDs
    if (AsyncStorage) {
      await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
    }
    
    return true;
  } catch (e) {
    logError('NotificationTriggers', 'Failed to cancel notifications', e as Error);
    return false;
  }
}
