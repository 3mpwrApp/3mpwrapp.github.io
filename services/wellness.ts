import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../firebase/config';

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

export async function addReflectionAt(createdAtISO: string, mood: Reflection['mood'], note?: string) {
  try {
    const base = process.env.EXPO_PUBLIC_LLM_BASE || process.env.EXPO_PUBLIC_API_BASE;
    const uid = auth.currentUser?.uid;
    if (base && uid) {
      const res = await fetch(`${base.replace(/\/$/, '')}/wellness/add-reflection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, createdAtISO, mood, note: note || '' }),
      });
      if (res.ok) return true;
    }
  } catch {}
  // Fallback: regular add (not backdated)
  await addReflection(mood, note);
  return false;
}

export async function listReflections(max: number = 10): Promise<Reflection[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const col = collection(db, 'users', uid, 'wellness_reflections');
  const q = query(col, orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function updateReflection(id: string, patch: Partial<Reflection>) {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  const { doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'users', uid, 'wellness_reflections', id), patch);
}

export async function deleteReflection(id: string) {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  const { doc, deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'users', uid, 'wellness_reflections', id));
}
