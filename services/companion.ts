import { auth, db } from '../firebase/config';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';

export type MoodEntry = { id?: string; mood: 'good'|'ok'|'bad'; notes?: string; createdAt?: any };

export async function addMood(mood: MoodEntry['mood'], notes?: string) {
  const uid = auth.currentUser?.uid || 'anon';
  const col = collection(db, 'users', uid, 'moods');
  await addDoc(col, { mood, notes: notes || '', createdAt: serverTimestamp() });
}

export async function listMoods(): Promise<MoodEntry[]> {
  const uid = auth.currentUser?.uid || 'anon';
  const col = collection(db, 'users', uid, 'moods');
  const snap = await getDocs(query(col, orderBy('createdAt','desc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

