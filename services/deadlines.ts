import { auth, db } from '../firebase/config';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';

export type Deadline = {
  id?: string;
  title: string;
  dueAt: string; // ISO string
  notes?: string;
  createdAt?: any;
};

export async function addDeadline(d: Omit<Deadline, 'id' | 'createdAt'>) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const col = collection(db, 'users', uid, 'deadlines');
  await addDoc(col, { ...d, createdAt: serverTimestamp() });
}

export async function listDeadlines(): Promise<Deadline[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const col = collection(db, 'users', uid, 'deadlines');
  const q = query(col, orderBy('dueAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function deleteDeadline(id: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  await deleteDoc(doc(db, 'users', uid, 'deadlines', id));
}

