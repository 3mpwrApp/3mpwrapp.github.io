import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export type Medication = {
  id?: string;
  name: string;
  dose?: string;
  schedule?: string; // e.g., 2x daily
  reminderTime?: string; // HH:MM local
  refillAt?: string; // ISO date for refill reminder
  startedAt?: string; // ISO
  notes?: string;
  createdAt?: any;
};

export type MedLog = {
  id?: string;
  medId: string;
  date: string; // ISO
  sideEffects?: string;
  effectiveness?: number; // 1-5
  notes?: string;
  createdAt?: any;
};

export async function addMedication(m: Omit<Medication, 'id' | 'createdAt'>) {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  await addDoc(collection(db, 'users', uid, 'medications'), { ...m, createdAt: serverTimestamp() });
}
export async function listMedications(): Promise<Medication[]> {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  const snap = await getDocs(query(collection(db, 'users', uid, 'medications'), orderBy('createdAt','desc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}
export async function updateMedication(id: string, patch: Partial<Medication>) {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  await updateDoc(doc(db, 'users', uid, 'medications', id), patch);
}
export async function deleteMedication(id: string) {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  await deleteDoc(doc(db, 'users', uid, 'medications', id));
}
export async function addMedLog(log: Omit<MedLog,'id'|'createdAt'>) {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  await addDoc(collection(db, 'users', uid, 'med_logs'), { ...log, createdAt: serverTimestamp() });
}
export async function listLogs(medId?: string): Promise<MedLog[]> {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  const col = collection(db, 'users', uid, 'med_logs');
  const q = medId ? query(col, where('medId','==', medId), orderBy('createdAt','desc')) : query(col, orderBy('createdAt','desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}
