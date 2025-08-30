// Firebase initialization for Expo (web-safe)
// On native, we initialize the core app but skip web-only analytics.
import { Platform } from "react-native";
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBv4rtD3it2yoIIFpxckCEXC9haKIbVjA8",
  authDomain: "empowrapp.firebaseapp.com",
  projectId: "empowrapp",
  storageBucket: "empowrapp.firebasestorage.app",
  messagingSenderId: "733708119893",
  appId: "1:733708119893:web:fdfb57d1be572fb3ee89dc",
  measurementId: "G-LKEKHG4GQ6",
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

// Lazy web analytics init to avoid bundling issues on native
export async function getFirebaseAnalytics(): Promise<any | null> {
  if (Platform.OS !== "web") return null;
  try {
    const { getAnalytics } = await import("firebase/analytics");
    const app = getFirebaseApp();
    return getAnalytics(app);
  } catch {
    return null;
  }
}

