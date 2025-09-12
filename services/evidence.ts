import { auth, db, storage } from '../firebase/config';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export type EvidenceFile = {
  name: string;
  url: string;
  path?: string; // storage path for cleanup
  contentType?: string;
  size?: number;
};

export async function uploadEvidenceFile(uri: string, name: string): Promise<EvidenceFile> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const path = `evidence/${uid}/${Date.now()}_${name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
  const r = ref(storage, path);
  const resp = await fetch(uri);
  const blob = await resp.blob();
  const size = (blob as any).size as number | undefined;
  await uploadBytes(r, blob as any);
  const url = await getDownloadURL(r);
  return { name, url, path, size };
}

export async function addEvidenceNote({
  text,
  tags,
  files,
}: {
  text?: string;
  tags?: string[];
  files?: EvidenceFile[];
}) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const col = collection(db, 'users', uid, 'evidence');
  await addDoc(col, {
    text: text || '',
    tags: tags || [],
    files: files || [],
    createdAt: serverTimestamp(),
  });
}

export async function listEvidence(): Promise<any[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const col = collection(db, 'users', uid, 'evidence');
  const q = query(col, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function deleteEvidenceDoc(id: string): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  try {
    const { doc, deleteDoc, getDoc } = await import('firebase/firestore');
    const dref = doc(db, 'users', uid, 'evidence', id);
    const snap = await getDoc(dref);
    const data = (snap.data() as any) || {};
    await deleteDoc(dref);
    // Best-effort delete of files if paths are present
    try {
      if (Array.isArray(data.files)) {
        const { ref: sref, deleteObject } = await import('firebase/storage');
        for (const f of data.files) {
          if (f?.path) {
            const r = sref(storage, f.path);
            await deleteObject(r);
          }
        }
      }
    } catch {}
    return true;
  } catch {
    return false;
  }
}
