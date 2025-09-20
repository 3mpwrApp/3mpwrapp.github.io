import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export async function registerExpoPushToken() {
  try {
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
