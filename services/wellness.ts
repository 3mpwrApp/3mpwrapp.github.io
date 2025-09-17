import { auth, db } from '../firebase/config';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';

export type Reflection = {
  id?: string;
  mood: 'bad' | 'ok' | 'good' | 'great';
  note?: string;
  createdAt?: any;
};

export async function addReflection(mood: Reflection['mood'], note?: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const col = collection(db, 'users', uid, 'wellness_reflections');
  await addDoc(col, { mood, note: note || '', createdAt: serverTimestamp() });
}

export async function listReflections(max: number = 10): Promise<Reflection[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const col = collection(db, 'users', uid, 'wellness_reflections');
  const q = query(col, orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

