// Defensive Platform import (may be partially mocked in Jest)
let ReactNativeAsyncStorage: any;
try {
  ReactNativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('[Firebase Config] AsyncStorage not available, using null:', e);
  ReactNativeAsyncStorage = null;
}
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
/**
 * NOTE FOR FORKERS/CONTRIBUTORS:
 * If you're deploying this app yourself, you MUST replace the Firebase config above
 * with your own Firebase project credentials. See README.md > Firebase Setup section.
 * 
 * The default config points to 3mpwr's demo project and should NOT be used in production.
 * Your users' data will be stored in whatever Firebase project is configured here.
 */

// Ensure only one app is initialized (when not strict)
export function getFirebaseApp(): FirebaseApp {
  try {
    return getApps().length ? getApp() : initializeApp(firebaseConfig);
  } catch (error) {
    console.error('[Firebase] Failed to initialize app:', error);
    throw error;
  }
}

let app: FirebaseApp | null = null;
try {
  if (!STRICT) {
    app = getFirebaseApp();

    if (!IS_TEST && platformOS !== "web") {
      try {
        // Only initialize auth with AsyncStorage if the native module is available
        if (ReactNativeAsyncStorage) {
          const { initializeAuth, getReactNativePersistence } = require("firebase/auth");
          initializeAuth(app, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) });
        } else {
          console.warn('[Firebase] AsyncStorage not available, Firebase Auth will use default persistence');
          // Initialize auth without persistence (will use memory-only persistence)
          const { initializeAuth } = require("firebase/auth");
          initializeAuth(app);
        }
      } catch (e) {
        // ignore if already initialized or other errors
        console.warn('[Firebase] Auth initialization warning:', e);
      }
    }
  }
} catch (error) {
  console.error('[Firebase] Init error:', error);
  if (__DEV__) {
    app = null;
  } else {
    throw error;
  }
}

export const auth = STRICT ? (null as any) : app ? getAuth(app) : null;

export const db = STRICT || HYBRID
  ? (null as any)
  : app && platformOS === "web"
    ? getFirestore(app)
    : app 
      ? initializeFirestore(app, { experimentalForceLongPolling: true })
      : null;

// Web-only: enable IndexedDB persistence for offline reads/write queue (non-strict, non-hybrid only)
try {
  const IS_TEST_ENV = typeof process !== 'undefined' && !!(process as any).env?.JEST_WORKER_ID;
  if (!STRICT && !HYBRID && platformOS === 'web' && !IS_TEST_ENV && db) {
    enableIndexedDbPersistence(db as any).catch((err) => {
      console.warn('[Firebase] IndexedDB persistence not enabled:', err);
    });
  }
} catch (err) {
  console.warn('[Firebase] Persistence setup error:', err);
}

export const storage = STRICT || HYBRID ? (null as any) : app ? getStorage(app) : null;

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

