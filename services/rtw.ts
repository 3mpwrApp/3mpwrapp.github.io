import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';

import { auth, db } from '../firebase/config';

export type RTWGoal = {
  id?: string;
  title: string;
  supports?: string[]; // e.g., modified duties, pacing, assistive tech
  steps?: string[];
  dueAt?: string; // ISO
  done?: boolean;
  createdAt?: any;
};

export async function addGoal(goal: Omit<RTWGoal, 'id' | 'createdAt'>) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const col = collection(db, 'users', uid, 'rtw_goals');
  await addDoc(col, { ...goal, createdAt: serverTimestamp() });
}

export async function listGoals(): Promise<RTWGoal[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const col = collection(db, 'users', uid, 'rtw_goals');
  const q = query(col, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function updateGoal(id: string, patch: Partial<RTWGoal>) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  await updateDoc(doc(db, 'users', uid, 'rtw_goals', id), patch);
}

export async function deleteGoal(id: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  await deleteDoc(doc(db, 'users', uid, 'rtw_goals', id));
}

