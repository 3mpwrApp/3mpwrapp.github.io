import { auth, db } from '../firebase/config';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';

export type TimelineEntry = { id?: string; title: string; date: string; description?: string; createdAt?: any };

export async function addEntry(e: Omit<TimelineEntry,'id'|'createdAt'>) {
  const uid = auth.currentUser?.uid || 'anon';
  await addDoc(collection(db, 'timeline_entries'), { ...e, uid, createdAt: serverTimestamp() });
}
export async function listEntries(): Promise<TimelineEntry[]> {
  const snap = await getDocs(query(collection(db,'timeline_entries'), orderBy('date','desc')));
  return snap.docs.map(d=>({ id:d.id, ...(d.data() as any) }));
}

