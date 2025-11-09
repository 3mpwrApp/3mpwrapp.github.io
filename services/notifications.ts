// Optional notification helper. Uses expo-notifications if available, else no-ops.
import { Platform } from "react-native";

import { logError } from '../utils/errorLogger';

// Lazy accessors to avoid loading optional native modules during tests/web
function getConstants(): any {
  try { return require('expo-constants'); } catch { return {}; }
}

// Cache to avoid repeated require() calls
let _notificationsModule: any | null | undefined = undefined;

function getNotifications(): any | null {
  if (_notificationsModule !== undefined) return _notificationsModule;
  
  try {
    // Check if we're in Expo Go before loading expo-notifications
    // This prevents the auto-registration warnings
    const Constants = getConstants();
    const isExpoGo = Constants?.default?.appOwnership === 'expo';
    
    if (isExpoGo && __DEV__) {
      // In Expo Go, expo-notifications will show warnings about push tokens
      // This is expected - local notifications still work fine
      // Suppress the warnings by intercepting console temporarily
      const originalWarn = console.warn;
      const originalError = console.error;
      
      console.warn = (...args: any[]) => {
        const msg = args.join(' ');
        if (!/expo-notifications.*Expo Go|Push.*Expo Go/i.test(msg)) {
          originalWarn.apply(console, args);
        }
      };
      
      console.error = (...args: any[]) => {
        const msg = args.join(' ');
        if (!/expo-notifications.*Expo Go|Push.*Expo Go/i.test(msg)) {
          originalError.apply(console, args);
        }
      };
      
      const module = require('expo-notifications');
      
      // Restore console after a delay (let auto-registration complete)
      setTimeout(() => {
        console.warn = originalWarn;
        console.error = originalError;
      }, 100);
      
      _notificationsModule = module;
      return module;
    }
    
    // In production builds, load normally
    _notificationsModule = require('expo-notifications');
    return _notificationsModule;
  } catch {
    _notificationsModule = null;
    return null;
  }
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
    // Fetch all user tokens from Firestore
    const { collection, getDocs } = await import('firebase/firestore');
    const { getDB } = await import('./firestore');
    
    const db = await getDB();
    const tokensSnapshot = await getDocs(collection(db, 'userTokens'));
    
    const tokens: string[] = [];
    tokensSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.token && data.token.startsWith('ExponentPushToken[')) {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      logError('Notifications', 'No push tokens registered yet', new Error('Empty token list'));
      return { success: true, sent: 0 };
    }

    // Prepare messages for Expo Push API
    const messages = tokens.map(token => ({
      to: token,
      sound: notification.sound || 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      badge: notification.badge,
    }));

    // Send to Expo Push API in batches of 100
    const BATCH_SIZE = 100;
    const results = [];
    
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);
      
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      const result = await response.json();
      results.push(...(result.data || []));
    }

    // Handle errors and remove invalid tokens
    const invalidTokens: string[] = [];
    results.forEach((item, idx) => {
      if (item.status === 'error') {
        if (item.details?.error === 'DeviceNotRegistered') {
          invalidTokens.push(tokens[idx]);
        }
         
        console.warn('[Notifications] Push error:', item.message);
      }
    });

    // Remove invalid tokens from Firestore
    if (invalidTokens.length > 0) {
      const { doc, deleteDoc } = await import('firebase/firestore');
      for (const token of invalidTokens) {
        try {
          // Find doc with this token
          tokensSnapshot.forEach(async (snapshot) => {
            if (snapshot.data().token === token) {
              await deleteDoc(doc(db, 'userTokens', snapshot.id));
            }
          });
        } catch {
          // Silent cleanup failure - not critical
        }
      }
    }

    return { success: true, sent: results.length, removed: invalidTokens.length };
  } catch (error) {
    logError('Notifications', 'Push notification error', error);
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
  // Check if event notifications are enabled
  const { isNotificationEnabled } = await import('./notificationPreferences');
  const enabled = await isNotificationEnabled('events');
  
  if (!enabled) {
    return { success: true, sent: 0, skipped: true };
  }
  
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
  // Check if campaign notifications are enabled
  const { isNotificationEnabled } = await import('./notificationPreferences');
  const enabled = await isNotificationEnabled('campaigns');
  
  if (!enabled) {
    return { success: true, sent: 0, skipped: true };
  }
  
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
export async function registerUserPushToken(userId: string) {
  const token = await getExpoPushToken();
  if (!token) {
    // No token available in current environment
    return null;
  }

  try {
    // Store token in Firestore
    const { doc, setDoc } = await import('firebase/firestore');
    const { getDB } = await import('./firestore');
    
    const db = await getDB();
    await setDoc(doc(db, 'userTokens', userId), {
      token,
      platform: Platform.OS,
      updatedAt: Date.now(),
      userId,
    });

    return token;
  } catch (error) {
    logError('Notifications', 'Token registration failed', error);
    return null;
  }
}
