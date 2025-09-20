import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function submitWaitTime(province: string, days: number) {
  await addDoc(collection(db, 'public_wait_times'), { province, days, createdAt: serverTimestamp() });
}

