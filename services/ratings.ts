import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where, setDoc, doc, limit as fsLimit } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export type Rating = { id?: string; target: string; kind: 'hospital'|'clinic'|'law'|'employer'|'union'|'other'; score: number; comment?: string; createdAt?: any };

export async function addRating(r: Omit<Rating,'id'|'createdAt'>) {
  const uid = auth.currentUser?.uid || 'anon';
  await addDoc(collection(db,'ratings'), { ...r, uid, createdAt: serverTimestamp() });
}
export async function listRatings(target: string): Promise<Rating[]> {
  const snap = await getDocs(query(collection(db,'ratings'), where('target','==', target), orderBy('createdAt','desc')));
  return snap.docs.map(d=>({ id:d.id, ...(d.data() as any) }));
}
export async function upsertRating(r: Omit<Rating,'id'|'createdAt'>) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sign in required');
  const key = `${uid}_${r.target.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
  await setDoc(doc(db,'ratings', key), { ...r, uid, createdAt: serverTimestamp() });
}

export async function ensureTarget(target: string) {
  const lower = target.toLowerCase();
  await setDoc(doc(db,'rating_targets', lower.replace(/[^a-z0-9._-]/g,'_')), { target, lower, updatedAt: serverTimestamp() });
}
export async function listTargets(prefix: string): Promise<string[]> {
  const snap = await getDocs(query(collection(db,'rating_targets'), fsLimit(50)));
  const arr = snap.docs.map(d => (d.data() as any).target as string);
  const p = (prefix||'').toLowerCase();
  return Array.from(new Set(arr)).filter(x => x.toLowerCase().includes(p)).slice(0, 10);
}
