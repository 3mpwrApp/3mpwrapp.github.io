import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';

import { auth, db } from '../firebase/config';

import { isCloudConsentEnabled } from './consent';

export type ChronicEntry = {
  id?: string;
  date: string; // ISO
  symptom: string;
  severity?: number; // 1-10
  trigger?: string;
  accommodations?: string; // needed supports
  notes?: string;
  createdAt?: any;
};

export async function addEntry(e: Omit<ChronicEntry,'id'|'createdAt'>) {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  if (!isCloudConsentEnabled()) throw new Error('Cloud features are disabled');
  await addDoc(collection(db, 'users', uid, 'chronic_entries'), { ...e, createdAt: serverTimestamp() });
}
export async function listEntries(): Promise<ChronicEntry[]> {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  const snap = await getDocs(query(collection(db, 'users', uid, 'chronic_entries'), orderBy('date','desc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}
export async function updateEntry(id: string, patch: Partial<ChronicEntry>) {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  if (!isCloudConsentEnabled()) throw new Error('Cloud features are disabled');
  await updateDoc(doc(db, 'users', uid, 'chronic_entries', id), patch);
}
export async function deleteEntry(id: string) {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  if (!isCloudConsentEnabled()) throw new Error('Cloud features are disabled');
  await deleteDoc(doc(db, 'users', uid, 'chronic_entries', id));
}

