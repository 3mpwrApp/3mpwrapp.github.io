import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPreferences {
  events: boolean;
  campaigns: boolean;
  reminders: boolean;
  rsvpConfirmations: boolean;
  capacityAlerts: boolean;
  cancellations: boolean;
}

const PREFS_KEY = 'notificationPreferences:v1';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  events: true,
  campaigns: true,
  reminders: true,
  rsvpConfirmations: true,
  capacityAlerts: true,
  cancellations: true,
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
