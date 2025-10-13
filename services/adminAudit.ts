import { getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getDocs, getFirestore, limit, onSnapshot, orderBy, query, startAfter } from 'firebase/firestore';

import { ADMIN_AUDIT_COLLECTION, type AdminAuditEvent } from '../types/adminAudit';

// Write an admin audit event. Safe no-op if Firebase not initialized.
export async function writeAdminAudit(evt: Omit<AdminAuditEvent, 'ts' | 'actorUid'> & { ts?: number; actorUid?: string | null }) {
  if (getApps().length === 0) return null;
  try {
    const db = getFirestore();
    const auth = getAuth();
    if (!db || !auth) return null;
    
    const actorUid = typeof evt.actorUid !== 'undefined' ? evt.actorUid : (auth.currentUser?.uid ?? null);
    const toStore: AdminAuditEvent = {
      ts: evt.ts || Date.now(),
      actorUid,
      action: evt.action,
      target: evt.target ?? null,
      details: evt.details ?? null,
      client: evt.client ?? null,
    };
    const ref = await addDoc(collection(db, ADMIN_AUDIT_COLLECTION), toStore as any);
    return ref.id;
  } catch {
    return null;
  }
}

export function subscribeAdminAudit(cb: (events: AdminAuditEvent[]) => void, opts: { limit?: number } = {}) {
  if (getApps().length === 0) return () => {};
  try {
    const db = getFirestore();
    if (!db) return () => {};
    
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
  } catch {
    return () => {};
  }
}

// One-shot list (export helper). Safe no-op if Firebase not initialized.
export async function listAdminAudit(opts: { limit?: number } = {}): Promise<AdminAuditEvent[]> {
  if (getApps().length === 0) return [];
  try {
    const db = getFirestore();
    if (!db) return [];
    
    const q = query(
      collection(db, ADMIN_AUDIT_COLLECTION),
      orderBy('ts', 'desc'),
      limit(opts.limit || 1000)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  } catch {
    return [];
  }
}

// Paged listing for large exports. Uses 'ts' as the cursor field.
export async function listAdminAuditPage(opts: { pageSize?: number; afterTs?: number | null } = {}): Promise<{ items: AdminAuditEvent[]; cursor: number | null }> {
  if (getApps().length === 0) return { items: [], cursor: null };
  try {
    const db = getFirestore();
    if (!db) return { items: [], cursor: null };
    
    const size = opts.pageSize || 500;
    const base = [collection(db, ADMIN_AUDIT_COLLECTION), orderBy('ts', 'desc')] as const;
    const q = opts.afterTs != null
      ? query(base[0], base[1], startAfter(opts.afterTs), limit(size))
      : query(base[0], base[1], limit(size));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    const last = items.length ? (items[items.length - 1] as any).ts as number : null;
    return { items, cursor: last ?? null };
  } catch {
    return { items: [], cursor: null };
  }
}

// Convenience to iterate pages up to maxDocs. Be mindful of Firestore quotas.
export async function listAdminAuditAll(opts: { batchSize?: number; maxDocs?: number } = {}): Promise<AdminAuditEvent[]> {
  const batchSize = Math.max(1, Math.min(1000, opts.batchSize || 500));
  const maxDocs = Math.max(batchSize, Math.min(10000, opts.maxDocs || 5000));
  const all: AdminAuditEvent[] = [];
  let cursor: number | null = null;
  // Loop until fewer than batchSize returned or we hit maxDocs
  for (;;) {
    const { items, cursor: next } = await listAdminAuditPage({ pageSize: batchSize, afterTs: cursor });
    if (!items.length) break;
    all.push(...items);
    if (all.length >= maxDocs) break;
    cursor = next;
    if (items.length < batchSize) break;
  }
  return all.slice(0, maxDocs);
}
