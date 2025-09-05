import { Platform } from "react-native";
import {
  initializeApp,
  getApp,
  getApps,
  type FirebaseApp,
} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Lazy load Analytics only on web
export async function getFirebaseAnalytics(): Promise<any | null> {
  if (Platform.OS !== "web") return null;
  try {
    const { getAnalytics } = await import("firebase/analytics");
    return getAnalytics(app);
  } catch {
    return null;
  }
}