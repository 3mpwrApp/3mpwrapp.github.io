// Optional notification helper. Uses expo-notifications if available, else no-ops.
let Constants: any = {};
try { Constants = require('expo-constants'); } catch {}
import { Platform } from "react-native";
let Notifications: any;
try {
  Notifications = require("expo-notifications");
} catch {}

let _permissionCache: boolean | null = null;
export async function ensureNotificationPermission() {
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
  if (!Notifications) return false;
  try { await Notifications.cancelScheduledNotificationAsync(id); return true; } catch { return false; }
}

// Get an Expo push token (web/native if available). Returns null if unsupported.
export async function getExpoPushToken(): Promise<string | null> {
  if (!Notifications) return null;
  // Skip in Expo Go where remote push isn't supported as of SDK 53
  if (Constants?.appOwnership === "expo") return null;
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token?.data ?? null;
  } catch {
    return null;
  }
}

// Send a local test notification now
export async function sendTestLocal() {
  await scheduleLocal("3mpowr App", "This is a test notification");
}

// Ensure alerts show while app is foregrounded
try {
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
