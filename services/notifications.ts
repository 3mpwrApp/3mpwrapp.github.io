// Optional notification helper. Uses expo-notifications if available, else no-ops.
let Notifications: any;
try {
  Notifications = require("expo-notifications");
} catch {}

export async function setupAsync() {
  if (!Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function scheduleLocal(title: string, body: string) {
  if (!Notifications) return false;
  try {
    await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
    return true;
  } catch {
    return false;
  }
}

