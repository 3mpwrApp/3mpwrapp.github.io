/**
 * Weekly "What's New" Summary Notification Service
 * 
 * Sends a silent, auto-expiring weekly notification summarizing recent updates.
 * Runs every Monday at 9 AM local time.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { whatsnewAuto } from '../data/whatsnew.auto';

import { cancel, scheduleDailyAt } from './notifications';

const WEEKLY_NOTIFICATION_KEY = 'weekly_whatsnew_notification_id';
const LAST_SUMMARY_DATE_KEY = 'last_whatsnew_summary_date';
const NOTIFICATION_ENABLED_KEY = 'weekly_whatsnew_enabled';

/**
 * Get What's New items from the last week
 */
function getRecentItems(daysBack = 7): typeof whatsnewAuto {
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  return whatsnewAuto
    .filter((item) => new Date(item.date).getTime() >= cutoff)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Check if weekly notifications are enabled
 */
export async function isWeeklyWhatsNewEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
    return enabled !== 'false'; // Default to true
  } catch {
    return true;
  }
}

/**
 * Enable or disable weekly What's New notifications
 */
export async function setWeeklyWhatsNewEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, enabled ? 'true' : 'false');
    
    if (enabled) {
      await scheduleWeeklyWhatsNewNotification();
    } else {
      await cancelWeeklyWhatsNewNotification();
    }
  } catch (error) {
    console.error('[WeeklyWhatsNew] Failed to set enabled state:', error);
  }
}

/**
 * Generate notification content from recent items
 */
function generateNotificationContent(items: typeof whatsnewAuto): { title: string; body: string } {
  if (items.length === 0) {
    return {
      title: "What's New This Week",
      body: "No new updates this week. Check back next Monday!",
    };
  }

  const count = items.length;
  const firstItem = items[0];
  
  // Create a brief summary of the most important item
  const summary = firstItem.title.length > 60 
    ? firstItem.title.slice(0, 57) + '...'
    : firstItem.title;

  return {
    title: `${count} Update${count === 1 ? '' : 's'} This Week`,
    body: `Latest: ${summary}. Tap to view all recent changes.`,
  };
}

/**
 * Schedule the weekly What's New notification
 * Runs every Monday at 9 AM local time
 */
export async function scheduleWeeklyWhatsNewNotification(): Promise<void> {
  try {
    // Check if enabled
    const enabled = await isWeeklyWhatsNewEnabled();
    if (!enabled) {
      return;
    }

    // Cancel existing notification if any
    await cancelWeeklyWhatsNewNotification();

    // Get recent items
    const recentItems = getRecentItems(7);
    const { title, body } = generateNotificationContent(recentItems);

    // Schedule for every Monday at 9 AM
    // Note: We use daily scheduling and check if it's Monday in the notification handler
    // This is a limitation of expo-notifications repeating trigger
    const notificationId = await scheduleDailyAt(9, 0, title, body);

    if (notificationId) {
      await AsyncStorage.setItem(WEEKLY_NOTIFICATION_KEY, notificationId);
      await AsyncStorage.setItem(LAST_SUMMARY_DATE_KEY, new Date().toISOString());
    }
  } catch (error) {
    console.error('[WeeklyWhatsNew] Failed to schedule notification:', error);
  }
}

/**
 * Cancel the weekly What's New notification
 */
export async function cancelWeeklyWhatsNewNotification(): Promise<void> {
  try {
    const notificationId = await AsyncStorage.getItem(WEEKLY_NOTIFICATION_KEY);
    if (notificationId) {
      await cancel(notificationId);
      await AsyncStorage.removeItem(WEEKLY_NOTIFICATION_KEY);
    }
  } catch (error) {
    console.error('[WeeklyWhatsNew] Failed to cancel notification:', error);
  }
}

/**
 * Check if we should send the weekly summary today
 * Only send on Mondays
 */
export function shouldSendToday(): boolean {
  const today = new Date();
  return today.getDay() === 1; // Monday
}

/**
 * Manually trigger a What's New summary notification
 * Useful for testing or immediate updates
 */
export async function sendWhatsNewSummaryNow(daysBack = 7): Promise<void> {
  try {
    const recentItems = getRecentItems(daysBack);
    const { title, body } = generateNotificationContent(recentItems);
    
    const { scheduleLocal } = await import('./notifications');
    await scheduleLocal(title, body);
    
    await AsyncStorage.setItem(LAST_SUMMARY_DATE_KEY, new Date().toISOString());
  } catch (error) {
    console.error('[WeeklyWhatsNew] Failed to send summary:', error);
  }
}

/**
 * Get the last summary date
 */
export async function getLastSummaryDate(): Promise<Date | null> {
  try {
    const dateStr = await AsyncStorage.getItem(LAST_SUMMARY_DATE_KEY);
    return dateStr ? new Date(dateStr) : null;
  } catch {
    return null;
  }
}

/**
 * Initialize weekly What's New notifications
 * Call this on app startup
 */
export async function initializeWeeklyWhatsNew(): Promise<void> {
  try {
    const enabled = await isWeeklyWhatsNewEnabled();
    if (enabled) {
      await scheduleWeeklyWhatsNewNotification();
    }
  } catch (error) {
    console.error('[WeeklyWhatsNew] Failed to initialize:', error);
  }
}
