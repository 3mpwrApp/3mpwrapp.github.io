// Defensive Platform import (may be partially mocked in Jest)
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore, initializeFirestore, setLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

import { isHybridBYOC, isStrictBYOC } from "../services/dataPolicy";

/**
 * ⚠️ IMPORTANT: THIS IS THE DEFAULT DEMO FIREBASE CONFIG
 * 
 * DO NOT USE THIS CONFIG IN PRODUCTION!
 * 
 * This config points to 3mpwr's demo Firebase project for testing purposes only.
 * 
 * FOR PRODUCTION USE:
 * 1. Create YOUR OWN Firebase project at https://firebase.google.com
 * 2. Replace the config below with YOUR project's credentials
 * 3. Deploy Cloud Functions to YOUR Firebase project
 * 
 * Your users' data will be stored in the Firebase project configured below.
 * By default, this is 3mpwr's demo project. You MUST change this before deploying.
 * 
 * See firebase/functions/README.md for setup instructions.
 */

const firebaseConfig = {
  // ⚠️ WARNING: Replace these with YOUR Firebase project credentials!
  // This is 3mpwr's demo project - DO NOT use in production
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
const HYBRID = isHybridBYOC();

// Runtime check: Warn if using default 3mpwr Firebase config
if (!STRICT && !IS_TEST && firebaseConfig.projectId === 'empowrapp') {
  console.warn(
    '\n' +
    '⚠️⚠️⚠️ WARNING: USING DEFAULT 3MPWR FIREBASE PROJECT ⚠️⚠️⚠️\n' +
    '\n' +
    'You are using the default demo Firebase config!\n' +
    'This config points to 3mpwr\'s demo Firebase project.\n' +
    '\n' +
    'DO NOT USE THIS IN PRODUCTION!\n' +
    '\n' +
    'Required actions:\n' +
    '1. Create YOUR OWN Firebase project at https://firebase.google.com\n' +
    '2. Replace config in firebase/config.ts with YOUR credentials\n' +
    '3. Deploy Cloud Functions to YOUR Firebase project\n' +
    '\n' +
    'Your users\' data will be stored in the configured Firebase project.\n' +
    'Using 3mpwr\'s project means data will be stored on our servers!\n' +
    '\n' +
    'See firebase/functions/README.md for setup instructions.\n' +
    '\n'
  );
}

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
// In hybrid mode: auth is enabled, but db/storage are null (user's cloud only)
export const auth = STRICT ? (null as any) : getAuth(app!);
export const db = STRICT || HYBRID
  ? (null as any)
  : platformOS === "web"
    ? getFirestore(app!)
    : initializeFirestore(app!, { experimentalForceLongPolling: true });

// Web-only: enable IndexedDB persistence for offline reads/write queue (non-strict, non-hybrid only)
try {
  const IS_TEST_ENV = typeof process !== 'undefined' && !!(process as any).env?.JEST_WORKER_ID;
  if (!STRICT && !HYBRID && platformOS === 'web' && !IS_TEST_ENV) {
    enableIndexedDbPersistence(db as any).catch(() => {});
  }
} catch {}

export const storage = STRICT || HYBRID ? (null as any) : getStorage(app!);

// Lazy load Analytics only on web (disabled in strict/hybrid)
export async function getFirebaseAnalytics(): Promise<any | null> {
  if (STRICT || HYBRID || platformOS !== "web") return null;
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
  if (!STRICT && !HYBRID) setLogLevel("error");
} catch {}
