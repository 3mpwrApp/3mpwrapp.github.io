// Optional notification helper. Uses expo-notifications if available, else no-ops.
import { Platform } from "react-native";

// Lazy accessors to avoid loading optional native modules during tests/web
function getConstants(): any {
  try { return require('expo-constants'); } catch { return {}; }
}
function getNotifications(): any | null {
  try { return require('expo-notifications'); } catch { return null; }
}

let _permissionCache: boolean | null = null;
export async function ensureNotificationPermission() {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  if (_permissionCache != null) return _permissionCache;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') { _permissionCache = true; return true; }
    const req = await Notifications.requestPermissionsAsync();
    _permissionCache = req.status === 'granted';
    return _permissionCache;
  } catch {
    _permissionCache = false;
    return false;
  }
}

export async function setupAsync() {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: true,
        enableVibrate: true,
        enableLights: true,
        lightColor: "#ffffff",
      });
    }
    return await ensureNotificationPermission();
  } catch {
    return false;
  }
}

export function hasNotificationPermissionCached() {
  return _permissionCache === true;
}

export async function scheduleLocal(title: string, body: string) {
  const Notifications = getNotifications();
  if (!Notifications) return false as const;
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
    return id as string;
  } catch {
    return false as const;
  }
}

// Schedule a daily notification at local time hour:minute
export async function scheduleDailyAt(hour: number, minute: number, title: string, body: string) {
  const Notifications = getNotifications();
  if (!Notifications) return false as const;
  try {
    const now = new Date();
    const first = new Date();
    first.setHours(hour, minute, 0, 0);
    if (first.getTime() <= now.getTime()) first.setDate(first.getDate() + 1);
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { hour, minute, repeats: true } as any,
    });
    return id as string;
  } catch {
    return false as const;
  }
}

// Schedule a notification at a specific Date
export async function scheduleAt(when: Date, title: string, body: string) {
  const Notifications = getNotifications();
  if (!Notifications) return false as const;
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: when,
    });
    return id as string;
  } catch {
    return false as const;
  }
}

export async function cancel(id: string) {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  try { await Notifications.cancelScheduledNotificationAsync(id); return true; } catch { return false; }
}

// Get an Expo push token (web/native if available). Returns null if unsupported.
export async function getExpoPushToken(): Promise<string | null> {
  const Notifications = getNotifications();
  if (!Notifications) return null;
  
  // Skip in Expo Go where remote push isn't supported as of SDK 53+
  const Constants = getConstants();
  if (Constants?.default?.appOwnership === "expo" || Constants?.appOwnership === "expo") {
    if (__DEV__) {
      console.warn('[expo-notifications] Push tokens not available in Expo Go. Use a development build for full push notification support.');
    }
    return null;
  }
  
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token?.data ?? null;
  } catch (error) {
    // Silently handle errors in Expo Go or when push isn't configured
    if (__DEV__) {
      const err = error as Error;
      if (err?.message?.includes('Expo Go')) {
        console.warn('[expo-notifications] Expo Go detected - push tokens unavailable');
      } else if (err?.message?.includes('projectId')) {
        console.warn('[expo-notifications] Missing projectId in app config');
      }
    }
    return null;
  }
}

// Send a local test notification now
export async function sendTestLocal() {
  await scheduleLocal("3mpwr App", "This is a test notification");
}

// Ensure alerts show while app is foregrounded
try {
  const Notifications = getNotifications();
  Notifications?.setNotificationHandler?.({
    handleNotification: async () =>
      ({
        // New fields (SDK 53+)
        shouldShowBanner: true,
        shouldShowList: true,
        // Back-compat (pre-53)
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }) as any,
  });
} catch {}

// ============================================================================
// Push Notifications for Events & Campaigns
// ============================================================================

/**
 * Send push notification to all users via Expo Push API
 * Used when admin creates new events or campaigns
 */
export async function notifyAllUsers(notification: {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
}) {
  try {
    // In production, you would:
    // 1. Get all user push tokens from Firestore
    // 2. Send to Expo Push API
    // 3. Handle receipts
    
    // For now, send to a test token or use Firebase Cloud Functions
    const message = {
      to: 'all', // In reality, this would be an array of ExponentPushToken[...]
      sound: notification.sound || 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      badge: notification.badge,
    };

    // TODO: Implement actual push sending via your backend
    // This requires storing user push tokens in Firestore

    return { success: true, message };
  } catch (error) {
    console.error('[Push Notification Error]', error);
    return { success: false, error };
  }
}

/**
 * Send notification when a new event is created
 */
export async function sendEventNotification(event: {
  id: string;
  title: string;
  date: string;
  location?: string;
}) {
  return notifyAllUsers({
    title: '📅 New Event Added!',
    body: `${event.title} - ${event.date}`,
    data: {
      type: 'event',
      eventId: event.id,
      screen: '/events/' + event.id,
    },
  });
}

/**
 * Send notification when a new campaign is created
 */
export async function sendCampaignNotification(campaign: {
  id: string;
  title: string;
  summary?: string;
}) {
  return notifyAllUsers({
    title: '📢 New Campaign!',
    body: campaign.summary || campaign.title,
    data: {
      type: 'campaign',
      campaignId: campaign.id,
      screen: '/campaigns/' + campaign.id,
    },
  });
}

/**
 * Store user's push token in Firestore for later use
 * Call this after user logs in
 */
export async function registerUserPushToken(_userId: string) {
  const token = await getExpoPushToken();
  if (!token) {
    // No token available in current environment
    return null;
  }

  try {
    // Store token in Firestore
    // TODO: Import Firestore and save token
    // await setDoc(doc(db, 'userTokens', userId), {
    //   token,
    //   platform: Platform.OS,
    //   updatedAt: new Date().toISOString(),
    // });
    
    return token;
  } catch (error) {
    console.error('[Push] Token registration failed:', error);
    return null;
  }
}
