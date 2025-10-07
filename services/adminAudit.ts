import { getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore, limit, onSnapshot, orderBy, query } from 'firebase/firestore';

import { ADMIN_AUDIT_COLLECTION, type AdminAuditEvent } from '../types/adminAudit';

// Write an admin audit event. Safe no-op if Firebase not initialized.
export async function writeAdminAudit(evt: Omit<AdminAuditEvent, 'ts' | 'actorUid'> & { ts?: number; actorUid?: string | null }) {
  if (getApps().length === 0) return null;
  const db = getFirestore();
  const auth = getAuth();
  const actorUid = typeof evt.actorUid !== 'undefined' ? evt.actorUid : (auth.currentUser?.uid ?? null);
  const toStore: AdminAuditEvent = {
    ts: evt.ts || Date.now(),
    actorUid,
    action: evt.action,
    target: evt.target ?? null,
    details: evt.details ?? null,
    client: evt.client ?? null,
  };
  try {
    const ref = await addDoc(collection(db, ADMIN_AUDIT_COLLECTION), toStore as any);
    return ref.id;
  } catch {
    return null;
  }
}

export function subscribeAdminAudit(cb: (events: AdminAuditEvent[]) => void, opts: { limit?: number } = {}) {
  const db = getFirestore();
  const q = query(
    collection(db, ADMIN_AUDIT_COLLECTION),
    orderBy('ts', 'desc'),
    limit(opts.limit || 200)
  );
  return onSnapshot(q, (snap) => {
    const list: AdminAuditEvent[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
    cb(list);
  });
}
