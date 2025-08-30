import { Platform } from "react-native";
import { getFirebaseApp, getFirebaseAnalytics } from "../firebase/config";

let analyticsLoaded: Promise<any | null> | null = null;

export function initAnalytics() {
  if (analyticsLoaded) return analyticsLoaded;
  // Ensure app is created
  getFirebaseApp();
  analyticsLoaded = getFirebaseAnalytics();
  return analyticsLoaded;
}

export async function logEvent(name: string, params?: Record<string, any>) {
  try {
    const analytics = await (analyticsLoaded ?? getFirebaseAnalytics());
    if (analytics && Platform.OS === "web") {
      const { logEvent } = await import("firebase/analytics");
      logEvent(analytics, name, params);
    } else {
      // No-op on native for now
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log("analytics:", name, params);
      }
    }
  } catch {
    // ignore
  }
}

