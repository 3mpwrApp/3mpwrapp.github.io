// Defensive Platform import (may be partially mocked in Jest)
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore, initializeFirestore, setLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

import { isStrictBYOC } from "../services/dataPolicy";

const firebaseConfig = {
  apiKey: "AIzaSyBv4rtD3it2yoIIFpxckCEXC9haKIbVjA8",
  authDomain: "empowrapp.firebaseapp.com",
  projectId: "empowrapp",
  storageBucket: "empowrapp.firebasestorage.app",
  messagingSenderId: "733708119893",
  appId: "1:733708119893:web:fdfb57d1be572fb3ee89dc",
  measurementId: "G-LKEKHG4GQ6",
};

// Detect test environment to avoid native-specific initialization in Jest
const IS_TEST = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID;
const platformOS = (Platform as any)?.OS || 'web';
const STRICT = isStrictBYOC();

// Ensure only one app is initialized (when not strict)
export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let app: FirebaseApp | null = null;
if (!STRICT) {
  app = getFirebaseApp();
  if (!IS_TEST && platformOS !== "web") {
    try {
      // Dynamically import RN-only APIs to avoid type mismatch on web
      const { initializeAuth, getReactNativePersistence } = require("firebase/auth");
      initializeAuth(app, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) });
    } catch {
      // ignore if already initialized or not available
    }
  }
}

// Export configured instances or nulls in strict mode
export const auth = STRICT ? (null as any) : getAuth(app!);
export const db = STRICT
  ? (null as any)
  : platformOS === "web"
    ? getFirestore(app!)
    : initializeFirestore(app!, { experimentalForceLongPolling: true });

// Web-only: enable IndexedDB persistence for offline reads/write queue (non-strict only)
try {
  const IS_TEST_ENV = typeof process !== 'undefined' && !!(process as any).env?.JEST_WORKER_ID;
  if (!STRICT && platformOS === 'web' && !IS_TEST_ENV) {
    enableIndexedDbPersistence(db as any).catch(() => {});
  }
} catch {}

export const storage = STRICT ? (null as any) : getStorage(app!);

// Lazy load Analytics only on web (disabled in strict)
export async function getFirebaseAnalytics(): Promise<any | null> {
  if (STRICT || platformOS !== "web") return null;
  try {
    const analyticsMod = await import("firebase/analytics");
    if (typeof (analyticsMod as any).isSupported === 'function') {
      const ok = await (analyticsMod as any).isSupported();
      if (!ok) return null;
    }
    return (analyticsMod as any).getAnalytics(app!);
  } catch {
    return null;
  }
}

// Reduce noisy Firestore warnings in development
try {
  if (!STRICT) setLogLevel("error");
} catch {}
