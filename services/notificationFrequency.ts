/**
 * Notification Frequency Service
 * 
 * Manages notification frequency settings for all categories.
 * Allows users to choose how often they receive notifications:
 * - realtime: Immediate notifications
 * - daily: Batched once per day at user's preferred time
 * - weekly: Batched once per week (Monday 9 AM)
 * - monthly: Batched once per month (1st of month)
 * - never: Disabled
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
    CategoryFrequencySettings,
    NotificationCategory,
    NotificationFrequency,
    NotificationPreferences,
} from '../types/notifications';
import {
    DEFAULT_CATEGORY_FREQUENCIES,
    DEFAULT_NOTIFICATION_PREFERENCES,
} from '../types/notifications';

import { cancel, scheduleDailyAt } from './notifications';

const PREFS_KEY = 'notification:frequency:prefs:v2';
const BATCH_QUEUE_KEY = 'notification:batch:queue:v1';
const SCHEDULED_NOTIFICATIONS_KEY = 'notification:scheduled:ids:v1';

interface BatchedNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: number;
  priority: 'low' | 'normal' | 'high';
}

interface ScheduledNotificationIds {
  daily?: string;
  weekly?: string;
  monthly?: string;
}

// ============================================================================
// PREFERENCES MANAGEMENT
// ============================================================================

/**
 * Get all notification preferences including frequency settings
 */
export async function getNotificationFrequencyPrefs(): Promise<NotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) {
      return DEFAULT_NOTIFICATION_PREFERENCES();
    }
    const parsed = JSON.parse(raw) as NotificationPreferences;
    // Migrate from v1 if needed
    if (!parsed.categoryFrequencies) {
      parsed.categoryFrequencies = { ...DEFAULT_CATEGORY_FREQUENCIES };
      parsed.defaultFrequency = 'daily';
      parsed.version = 2;
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES();
  }
}

/**
 * Save notification preferences
 */
export async function saveNotificationFrequencyPrefs(
  prefs: Partial<NotificationPreferences>
): Promise<void> {
  try {
    const current = await getNotificationFrequencyPrefs();
    const updated: NotificationPreferences = {
      ...current,
      ...prefs,
      lastUpdated: Date.now(),
    };
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    // Reschedule batch notifications based on new preferences
    await rescheduleAllBatchNotifications(updated);
  } catch (error) {
    console.error('[NotificationFrequency] Failed to save preferences:', error);
  }
}

/**
 * Set frequency for a specific category
 */
export async function setCategoryFrequency(
  category: NotificationCategory,
  frequency: NotificationFrequency
): Promise<void> {
  const prefs = await getNotificationFrequencyPrefs();
  prefs.categoryFrequencies[category] = {
    ...prefs.categoryFrequencies[category],
    frequency,
  };
  await saveNotificationFrequencyPrefs(prefs);
}

/**
 * Toggle category enabled state
 */
export async function setCategoryEnabled(
  category: NotificationCategory,
  enabled: boolean
): Promise<void> {
  const prefs = await getNotificationFrequencyPrefs();
  prefs.categories[category] = enabled;
  prefs.categoryFrequencies[category] = {
    ...prefs.categoryFrequencies[category],
    enabled,
  };
  await saveNotificationFrequencyPrefs(prefs);
}

/**
 * Set default frequency for all categories
 */
export async function setDefaultFrequency(
  frequency: NotificationFrequency
): Promise<void> {
  const prefs = await getNotificationFrequencyPrefs();
  prefs.defaultFrequency = frequency;
  await saveNotificationFrequencyPrefs(prefs);
}

/**
 * Get settings for a specific category
 */
export async function getCategorySettings(
  category: NotificationCategory
): Promise<CategoryFrequencySettings> {
  const prefs = await getNotificationFrequencyPrefs();
  return prefs.categoryFrequencies[category] || DEFAULT_CATEGORY_FREQUENCIES[category];
}

// ============================================================================
// BATCH QUEUE MANAGEMENT
// ============================================================================

/**
 * Add a notification to the batch queue (for non-realtime frequencies)
 */
export async function queueNotification(
  notification: Omit<BatchedNotification, 'id' | 'createdAt'>
): Promise<void> {
  try {
    const queue = await getBatchQueue();
    const newNotification: BatchedNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    queue.push(newNotification);
    await AsyncStorage.setItem(BATCH_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[NotificationFrequency] Failed to queue notification:', error);
  }
}

/**
 * Get all queued notifications
 */
export async function getBatchQueue(): Promise<BatchedNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(BATCH_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get queued notifications for a specific category
 */
export async function getCategoryQueue(
  category: NotificationCategory
): Promise<BatchedNotification[]> {
  const queue = await getBatchQueue();
  return queue.filter(n => n.category === category);
}

/**
 * Clear queue for a specific category
 */
export async function clearCategoryQueue(
  category: NotificationCategory
): Promise<void> {
  try {
    const queue = await getBatchQueue();
    const filtered = queue.filter(n => n.category !== category);
    await AsyncStorage.setItem(BATCH_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[NotificationFrequency] Failed to clear category queue:', error);
  }
}

/**
 * Clear entire batch queue
 */
export async function clearBatchQueue(): Promise<void> {
  try {
    await AsyncStorage.setItem(BATCH_QUEUE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('[NotificationFrequency] Failed to clear batch queue:', error);
  }
}

// ============================================================================
// SCHEDULED NOTIFICATION MANAGEMENT
// ============================================================================

/**
 * Get scheduled notification IDs
 */
async function getScheduledIds(): Promise<ScheduledNotificationIds> {
  try {
    const raw = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save scheduled notification IDs
 */
async function saveScheduledIds(ids: ScheduledNotificationIds): Promise<void> {
  try {
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('[NotificationFrequency] Failed to save scheduled IDs:', error);
  }
}

/**
 * Cancel all scheduled batch notifications
 */
async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    const ids = await getScheduledIds();
    if (ids.daily) await cancel(ids.daily);
    if (ids.weekly) await cancel(ids.weekly);
    if (ids.monthly) await cancel(ids.monthly);
    await saveScheduledIds({});
  } catch (error) {
    console.error('[NotificationFrequency] Failed to cancel scheduled notifications:', error);
  }
}

/**
 * Reschedule all batch notifications based on preferences
 */
async function rescheduleAllBatchNotifications(
  prefs: NotificationPreferences
): Promise<void> {
  try {
    // Cancel existing scheduled notifications
    await cancelAllScheduledNotifications();

    const ids: ScheduledNotificationIds = {};
    const hasDaily = Object.values(prefs.categoryFrequencies).some(
      c => c.enabled && c.frequency === 'daily'
    );
    const hasWeekly = Object.values(prefs.categoryFrequencies).some(
      c => c.enabled && c.frequency === 'weekly'
    );

    // Schedule daily batch at 9 AM if any category uses daily
    if (hasDaily) {
      const dailyId = await scheduleDailyAt(
        9, 0,
        'Daily Update Summary',
        'Check your daily notifications summary.'
      );
      if (dailyId) ids.daily = dailyId;
    }

    // Weekly is handled by the same mechanism (Monday check in handler)
    if (hasWeekly) {
      const weeklyId = await scheduleDailyAt(
        9, 0,
        'Weekly Update Summary',
        'Check your weekly notifications summary.'
      );
      if (weeklyId) ids.weekly = weeklyId;
    }

    await saveScheduledIds(ids);
  } catch (error) {
    console.error('[NotificationFrequency] Failed to reschedule notifications:', error);
  }
}

// ============================================================================
// SEND LOGIC WITH FREQUENCY CHECK
// ============================================================================

/**
 * Check if a notification should be sent now or queued
 * Returns true if should send immediately, false if queued
 */
export async function shouldSendNotification(
  category: NotificationCategory,
  title: string,
  body: string,
  priority: 'low' | 'normal' | 'high' = 'normal'
): Promise<boolean> {
  const prefs = await getNotificationFrequencyPrefs();
  
  // Check if category is enabled
  if (!prefs.categories[category]) {
    return false;
  }

  const settings = prefs.categoryFrequencies[category];
  if (!settings?.enabled) {
    return false;
  }

  // Handle based on frequency
  switch (settings.frequency) {
    case 'realtime':
      return true;
    
    case 'never':
      return false;
    
    case 'daily':
    case 'weekly':
    case 'monthly':
      // Queue for batch sending
      await queueNotification({ category, title, body, priority });
      return false;
    
    default:
      return true;
  }
}

/**
 * Check if it's time to send batched notifications for a frequency
 */
export function isTimeToSendBatch(
  frequency: NotificationFrequency,
  lastSent?: number
): boolean {
  if (!lastSent) return true;
  
  const now = Date.now();
  const hoursSinceLast = (now - lastSent) / (1000 * 60 * 60);
  const daysSinceLast = hoursSinceLast / 24;
  
  switch (frequency) {
    case 'daily':
      return hoursSinceLast >= 23; // Allow 1 hour buffer
    case 'weekly':
      return daysSinceLast >= 6.5; // Allow half day buffer
    case 'monthly':
      return daysSinceLast >= 28; // Roughly monthly
    default:
      return false;
  }
}

/**
 * Generate a batch summary notification
 */
export function generateBatchSummary(
  notifications: BatchedNotification[],
  frequency: NotificationFrequency
): { title: string; body: string } {
  const count = notifications.length;
  
  if (count === 0) {
    return {
      title: `No New Updates`,
      body: `You're all caught up!`,
    };
  }
  
  const frequencyLabel = frequency === 'daily' ? 'Today' : 
                         frequency === 'weekly' ? 'This Week' : 
                         'This Month';
  
  // Group by category
  const byCategory: Record<string, number> = {};
  notifications.forEach(n => {
    byCategory[n.category] = (byCategory[n.category] || 0) + 1;
  });
  
  const categoryList = Object.entries(byCategory)
    .map(([cat, cnt]) => `${cnt} ${cat}`)
    .join(', ');
  
  return {
    title: `${count} Update${count === 1 ? '' : 's'} ${frequencyLabel}`,
    body: categoryList || 'Tap to view your updates.',
  };
}

/**
 * Process and send all queued batch notifications
 */
export async function processBatchQueue(
  frequency: NotificationFrequency
): Promise<void> {
  try {
    const prefs = await getNotificationFrequencyPrefs();
    const queue = await getBatchQueue();
    
    // Filter notifications for categories with this frequency
    const relevantCategories = Object.entries(prefs.categoryFrequencies)
      .filter(([_, settings]) => settings.frequency === frequency && settings.enabled)
      .map(([category]) => category as NotificationCategory);
    
    const toSend = queue.filter(n => relevantCategories.includes(n.category));
    
    if (toSend.length === 0) return;
    
    const { title, body } = generateBatchSummary(toSend, frequency);
    
    // Send the batch notification
    const { scheduleLocal } = await import('./notifications');
    await scheduleLocal(title, body);
    
    // Update lastSent for all relevant categories
    relevantCategories.forEach(category => {
      prefs.categoryFrequencies[category].lastSent = Date.now();
    });
    await saveNotificationFrequencyPrefs(prefs);
    
    // Clear sent notifications from queue
    const remainingQueue = queue.filter(n => !relevantCategories.includes(n.category));
    await AsyncStorage.setItem(BATCH_QUEUE_KEY, JSON.stringify(remainingQueue));
  } catch (error) {
    console.error('[NotificationFrequency] Failed to process batch queue:', error);
  }
}

// ============================================================================
// FREQUENCY LABELS & HELPERS
// ============================================================================

export const FREQUENCY_LABELS: Record<NotificationFrequency, string> = {
  realtime: 'Immediately',
  daily: 'Daily digest',
  weekly: 'Weekly digest',
  monthly: 'Monthly digest',
  never: 'Never',
};

export const FREQUENCY_DESCRIPTIONS: Record<NotificationFrequency, string> = {
  realtime: 'Get notified right away',
  daily: 'Receive a daily summary at 9 AM',
  weekly: 'Receive a weekly summary on Mondays',
  monthly: 'Receive a monthly summary on the 1st',
  never: 'Don\'t send notifications',
};

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  advocacy: 'Advocacy & Rights',
  wellness: 'Wellness & Health',
  resources: 'Resources & Tools',
  community: 'Community',
  system: 'System Alerts',
  evidence: 'Evidence Locker',
  admin: 'Admin Updates',
  whatsnew: 'What\'s New',
};

export const CATEGORY_DESCRIPTIONS: Record<NotificationCategory, string> = {
  advocacy: 'Petitions, campaigns, and legal updates',
  wellness: 'Health reminders and wellness tips',
  resources: 'New resources and tool updates',
  community: 'Messages and community activity',
  system: 'Important app updates and alerts',
  evidence: 'Evidence locker sync and reminders',
  admin: 'Admin announcements',
  whatsnew: 'App updates and new features',
};
