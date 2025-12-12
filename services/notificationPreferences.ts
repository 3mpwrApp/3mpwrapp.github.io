import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification category types
export type NotificationCategory = 
  | 'events' 
  | 'campaigns' 
  | 'reminders' 
  | 'rsvpConfirmations' 
  | 'capacityAlerts' 
  | 'cancellations'
  | 'wellness'
  | 'medication'
  | 'deadlines'
  | 'achievements'
  | 'community';

export interface NotificationSchedule {
  hour: number;
  minute: number;
}

export interface NotificationPreferences {
  // Original categories
  events: boolean;
  campaigns: boolean;
  reminders: boolean;
  rsvpConfirmations: boolean;
  capacityAlerts: boolean;
  cancellations: boolean;
  // Additional categories for triggers
  wellness: boolean;
  medication: boolean;
  deadlines: boolean;
  achievements: boolean;
  community: boolean;
}

const PREFS_KEY = 'notificationPreferences:v1';
const SCHEDULE_KEY = 'notificationSchedules:v1';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  events: true,
  campaigns: true,
  reminders: true,
  rsvpConfirmations: true,
  capacityAlerts: true,
  cancellations: true,
  wellness: true,
  medication: true,
  deadlines: true,
  achievements: true,
  community: true,
};

const DEFAULT_SCHEDULES: Record<string, NotificationSchedule> = {
  wellness: { hour: 9, minute: 0 },
  medication: { hour: 8, minute: 0 },
  reminders: { hour: 10, minute: 0 },
};

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(PREFS_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch (error) {
    console.warn('[NotificationPrefs] Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Update notification preferences
 */
export async function setNotificationPreferences(
  prefs: Partial<NotificationPreferences>
): Promise<void> {
  try {
    const current = await getNotificationPreferences();
    const updated = { ...current, ...prefs };
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('[NotificationPrefs] Failed to save preferences:', error);
  }
}

/**
 * Check if a specific notification type is enabled
 */
export async function isNotificationEnabled(
  type: keyof NotificationPreferences
): Promise<boolean> {
  const prefs = await getNotificationPreferences();
  return prefs[type];
}

/**
 * Reset to default preferences
 */
export async function resetNotificationPreferences(): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(DEFAULT_PREFERENCES));
  } catch (error) {
    console.warn('[NotificationPrefs] Failed to reset preferences:', error);
  }
}

/**
 * Get notification schedule for a specific category
 */
export async function getNotificationSchedule(
  category: string
): Promise<NotificationSchedule | null> {
  try {
    const stored = await AsyncStorage.getItem(SCHEDULE_KEY);
    const schedules = stored ? JSON.parse(stored) : {};
    return schedules[category] || DEFAULT_SCHEDULES[category] || null;
  } catch (error) {
    console.warn('[NotificationPrefs] Failed to load schedule:', error);
    return DEFAULT_SCHEDULES[category] || null;
  }
}

/**
 * Set notification schedule for a specific category
 */
export async function setNotificationSchedule(
  category: string,
  schedule: NotificationSchedule
): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(SCHEDULE_KEY);
    const schedules = stored ? JSON.parse(stored) : {};
    schedules[category] = schedule;
    await AsyncStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.warn('[NotificationPrefs] Failed to save schedule:', error);
  }
}
