import { auth, db } from '../firebase/config';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore';

export type Rating = { id?: string; target: string; kind: 'hospital'|'clinic'|'law'|'employer'|'union'|'other'; score: number; comment?: string; createdAt?: any };

export async function addRating(r: Omit<Rating,'id'|'createdAt'>) {
  const uid = auth.currentUser?.uid || 'anon';
  await addDoc(collection(db,'ratings'), { ...r, uid, createdAt: serverTimestamp() });
}
export async function listRatings(target: string): Promise<Rating[]> {
  const snap = await getDocs(query(collection(db,'ratings'), where('target','==', target), orderBy('createdAt','desc')));
  return snap.docs.map(d=>({ id:d.id, ...(d.data() as any) }));
}

