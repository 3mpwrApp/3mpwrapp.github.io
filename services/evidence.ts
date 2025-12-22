import { addDoc, collection, limit as fsLimit, startAfter as fsStartAfter, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';

import { auth, db, storage } from '../firebase/config';
import { fetchWithRetry } from '../utils/network';

import { isOnline, queueForSync } from './backgroundSync';
import { isCloudConsentEnabled } from './consent';

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
  if (!isCloudConsentEnabled()) throw new Error('Cloud features are disabled');
  const path = `evidence/${uid}/${Date.now()}_${name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
  const r = ref(storage, path);
  
  // Use network utility for better error handling
  const resp = await fetchWithRetry(uri, {
    timeout: 30000, // Longer timeout for file uploads
    retries: 2,
  });
  
  const blob = await resp.blob();
  const size = (blob as any).size as number | undefined;
  await uploadBytes(r, blob as any);
  const url = await getDownloadURL(r);
  return { name, url, path, size };
}

export async function uploadEvidenceFileWithProgress(
  uri: string,
  name: string,
  onProgress?: (pct: number) => void,
): Promise<EvidenceFile> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not signed in');
    if (!isCloudConsentEnabled()) throw new Error('Cloud features are disabled');
    const path = `evidence/${uid}/${Date.now()}_${name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
    const r = ref(storage, path);
    
    // Use network utility for better error handling
    const resp = await fetchWithRetry(uri, {
      timeout: 30000,
      retries: 2,
    });
    
    const blob = await resp.blob();
    const size = (blob as any).size as number | undefined;
    const task = uploadBytesResumable(r, blob as any);
    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        (snap) => {
          if (onProgress) {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            onProgress(pct);
          }
        },
        (err) => reject(err),
        () => resolve(),
      );
    });
    const url = await getDownloadURL(r);
    return { name, url, path, size };
  } catch {
    // Fallback to non-resumable
    const f = await uploadEvidenceFile(uri, name);
    if (onProgress) onProgress(100);
    return f;
  }
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
  if (!isCloudConsentEnabled()) throw new Error('Cloud features are disabled');
  
  // Check if online - if not, queue for background sync
  const online = await isOnline();
  if (!online) {
    // Queue for background sync
    await queueForSync('evidence', 'create', {
      text: text || '',
      tags: tags || [],
      files: files || [],
      userId: uid,
    }, 'high');
    return; // Will be synced when online
  }
  
  if (!db) throw new Error('Firestore not initialized');

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
  if (!db) throw new Error('Firestore not initialized');

  const col = collection(db, 'users', uid, 'evidence');
  const q = query(col, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function listEvidencePage(pageSize = 10, cursor?: any): Promise<{ items: any[]; cursor: any | null }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  if (!db) throw new Error('Firestore not initialized');

  const col = collection(db, 'users', uid, 'evidence');
  const base = query(col, orderBy('createdAt', 'desc'), fsLimit(pageSize));
  const q = cursor ? query(base, fsStartAfter(cursor)) : base;
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  const next = snap.docs[snap.docs.length - 1] || null;
  return { items, cursor: next };
}

export async function deleteEvidenceDoc(id: string): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  if (!isCloudConsentEnabled()) return false;
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
