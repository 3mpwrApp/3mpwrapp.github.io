import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, limit as fsLimit } from 'firebase/firestore';

import { db } from '../firebase/config';

export async function flagItem(type: 'mutual'|'rating', targetId: string, reason: string) {
  await addDoc(collection(db,'flags'), { type, targetId, reason, createdAt: new Date() });
}
export async function listFlags(max = 50) {
  const snap = await getDocs(query(collection(db,'flags'), orderBy('createdAt','desc'), fsLimit(max)));
  return snap.docs.map(d=>({ id:d.id, ...(d.data() as any) }));
}
export async function resolveFlag(id: string) {
  await deleteDoc(doc(db,'flags', id));
}
