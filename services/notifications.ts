// Optional notification helper. Uses expo-notifications if available, else no-ops.
import { Platform } from "react-native";
import Constants from "expo-constants";
let Notifications: any;
try {
  Notifications = require("expo-notifications");
} catch {}

export async function setupAsync() {
  if (!Notifications) return false;
  try {
    // Android: ensure default channel exists
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: true,
        enableVibrate: true,
        enableLights: true,
        lightColor: "#ffffff",
      });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function scheduleLocal(title: string, body: string) {
  if (!Notifications) return false;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
    return true;
  } catch {
    return false;
  }
}

// Schedule a daily notification at local time hour:minute
export async function scheduleDailyAt(hour: number, minute: number, title: string, body: string) {
  if (!Notifications) return false;
  try {
    const now = new Date();
    const first = new Date();
    first.setHours(hour, minute, 0, 0);
    if (first.getTime() <= now.getTime()) first.setDate(first.getDate() + 1);
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { hour, minute, repeats: true } as any,
    });
    return true;
  } catch {
    return false;
  }
}

// Schedule a notification at a specific Date
export async function scheduleAt(when: Date, title: string, body: string) {
  if (!Notifications) return false;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: when,
    });
    return true;
  } catch {
    return false;
  }
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
  await scheduleLocal("Empowr", "This is a test notification");
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
