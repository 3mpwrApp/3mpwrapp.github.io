import { doc, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

import { auth, db } from '../firebase/config';

import { isCloudConsentEnabled } from './consent';

function getNotifications(): any | null {
  try { return require('expo-notifications'); } catch { return null; }
}

export async function registerExpoPushToken() {
  try {
    // Don't collect or store tokens unless user has allowed cloud features
    if (!isCloudConsentEnabled()) return null;
    // Web does not fully support push token listeners; skip to avoid warnings
    if (Platform.OS === 'web') return null;
    const Notifications = getNotifications();
    if (!Notifications) return null;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;
  const projId = (Notifications as any).projectId || undefined;
  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: projId });
    const token = tokenData.data as string;
    const uid = auth.currentUser?.uid || 'anon';
    await setDoc(doc(db, 'user_tokens', uid), { expo: token, updatedAt: new Date().toISOString(), platform: Platform.OS }, { merge: true });
    return token;
  } catch {
    return null;
  }
}

export async function saveFcmToken(token: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await setDoc(doc(db, 'user_tokens', uid), { fcm: token, updatedAt: new Date().toISOString() }, { merge: true });
}
