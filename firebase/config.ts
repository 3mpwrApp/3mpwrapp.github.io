// Defensive Platform import (may be partially mocked in Jest)
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, setLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBv4rtD3it2yoIIFpxckCEXC9haKIbVjA8",
  authDomain: "empowrapp.firebaseapp.com",
  projectId: "empowrapp",
  storageBucket: "empowrapp.firebasestorage.app",
  messagingSenderId: "733708119893",
  appId: "1:733708119893:web:fdfb57d1be572fb3ee89dc",
  measurementId: "G-LKEKHG4GQ6",
};

// Ensure only one app is initialized
export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

const app = getFirebaseApp();
// Detect test environment to avoid native-specific initialization in Jest
const IS_TEST = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID;
const platformOS = (Platform as any)?.OS || 'web';

// Ensure Auth persistence on native by initializing before getAuth (skip in tests)
if (!IS_TEST && platformOS !== "web") {
  try {
    // Dynamically import RN-only APIs to avoid type mismatch on web
    const {
      initializeAuth,
      getReactNativePersistence,
    } = require("firebase/auth");
    initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    // ignore if already initialized or not available
  }
}
export const auth = getAuth(app);
// Firestore: use long-polling on native to avoid WebChannel transport issues
export const db =
  platformOS === "web"
    ? getFirestore(app)
    : initializeFirestore(app, {
        // Force long polling on native to avoid WebChannel transport issues
        experimentalForceLongPolling: true,
      });
export const storage = getStorage(app);

// Lazy load Analytics only on web
export async function getFirebaseAnalytics(): Promise<any | null> {
  if (platformOS !== "web") return null;
  try {
    const analyticsMod = await import("firebase/analytics");
    if (typeof (analyticsMod as any).isSupported === 'function') {
      const ok = await (analyticsMod as any).isSupported();
      if (!ok) return null;
    }
    return (analyticsMod as any).getAnalytics(app);
  } catch {
    return null;
  }
}

// Reduce noisy Firestore warnings in development
try {
  setLogLevel("error");
} catch {}
