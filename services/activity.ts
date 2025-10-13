import { getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';


import type { ActivityEventType, AnyActivityEvent, BaseActivityEvent } from '../types/activity';
import { ACTIVITY_COLLECTION } from '../types/activity';

import { isTelemetryConsentEnabled } from './consent';

// Firestore write helper. Minimal validation to keep lightweight.
export async function logActivity<T extends ActivityEventType>(evt: Omit<BaseActivityEvent<T>, 'ts'> & { ts?: number }) {
  // In test / SSR contexts Firebase may not be initialized; fail silently.
  if (getApps().length === 0) return null;
  // Respect user telemetry consent — no remote writes without it
  if (!isTelemetryConsentEnabled()) return null;
  
  try {
    const db = getFirestore();
    const auth = getAuth();
    // In strict BYOC mode, these might be null
    if (!db || !auth) return null;
    
    const userId = evt.userId || auth.currentUser?.uid;
    const toStore: any = {
      type: evt.type,
      ts: evt.ts || Date.now(),
      userId: userId || null,
      payload: evt.payload || null,
      summaryKey: evt.summaryKey || null,
      metadata: evt.metadata || null,
      // serverTimestamp used as secondary ordering fallback
      createdAt: serverTimestamp()
    };
    
    const ref = await addDoc(collection(db, ACTIVITY_COLLECTION), toStore);
    return ref.id;
  } catch {
    return null;
  }
}

export interface FeedSubscriptionOptions {
  limit?: number;
  onError?: (e: Error) => void;
}

export function subscribeToActivityFeed(cb: (events: AnyActivityEvent[]) => void, opts: FeedSubscriptionOptions = {}) {
  // Guard against null db in strict BYOC mode
  if (getApps().length === 0) {
    if (opts.onError) opts.onError(new Error('Firebase not initialized'));
    return () => {}; // Return no-op unsubscribe function
  }
  
  try {
    const db = getFirestore();
    if (!db) {
      if (opts.onError) opts.onError(new Error('Firestore not available'));
      return () => {}; // Return no-op unsubscribe function
    }
    
    const q = query(
      collection(db, ACTIVITY_COLLECTION),
      orderBy('ts', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(opts.limit || 100)
    );
    return onSnapshot(q, snap => {
      const events: AnyActivityEvent[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          type: data.type,
          ts: typeof data.ts === 'number' ? data.ts : (data.ts instanceof Timestamp ? data.ts.toMillis() : Date.now()),
          userId: data.userId || undefined,
          payload: data.payload || undefined,
          summaryKey: data.summaryKey || undefined,
          metadata: data.metadata || undefined,
        } as AnyActivityEvent;
      });
      cb(events);
    }, err => { if(opts.onError) opts.onError(err as Error); });
  } catch (error) {
    if (opts.onError) opts.onError(error as Error);
    return () => {}; // Return no-op unsubscribe function
  }
}

// Lightweight aggregation (client side). Extend later with server functions.
export function computeActivityStats(events: AnyActivityEvent[]) {
  const counts: Record<string, number> = {};
  let since24h = 0;
  const cutoff = Date.now() - 24*60*60*1000;
  events.forEach(e => {
    counts[e.type] = (counts[e.type] || 0) + 1;
    if (e.ts >= cutoff) since24h++;
  });
  return { total: events.length, since24h, byType: counts };
}
