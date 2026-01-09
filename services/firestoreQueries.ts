/**
 * Firestore Optimized Queries
 *
 * Provides collection-specific query functions with pagination,
 * proper indexing support, and listener cleanup.
 *
 * All queries use cursor-based pagination to avoid re-fetching.
 * Requires composite indexes as documented in firebase/firestore.rules
 */

import type { DocumentSnapshot } from 'firebase/firestore';

import type { Campaign } from '../types/models';
import type { Event } from '../types/validation';

// Cache for active listeners to prevent duplicates
const listenerCache = new Map<string, {
  unsubscribe: () => void;
  lastTimestamp: number;
}>();

/**
 * Get campaigns with pagination (active campaigns ordered by recency)
 *
 * @example
 * const { items, cursor, hasMore } = await getCampaigns(20);
 * const next = await getCampaigns(20, cursor);
 */
export async function getCampaigns(
  limit: number = 20,
  cursor: DocumentSnapshot<any> | null = null
): Promise<{
  items: (Campaign & { id: string })[];
  cursor: DocumentSnapshot<any> | null;
  hasMore: boolean;
}> {
  const m = await import('firebase/firestore');
  const { db } = await import('../firebase/config');

  if (!db) throw new Error('Firestore not initialized');

  const constraints: any[] = [
    m.where('active', '==', true),
    m.orderBy('createdAt', 'desc'),
    m.limit(limit + 1), // +1 to detect more
  ];

  if (cursor) {
    constraints.push(m.startAfter(cursor));
  }

  const q = m.query(m.collection(db, 'campaigns'), ...constraints);
  const snap = await m.getDocs(q);

  const hasMore = snap.docs.length > limit;
  const items = snap.docs.slice(0, limit).map((d) => ({
    id: d.id,
    ...d.data(),
  })) as (Campaign & { id: string })[];

  return {
    items,
    cursor: hasMore ? snap.docs[limit - 1] : null,
    hasMore,
  };
}

/**
 * Subscribe to campaigns with real-time updates
 *
 * @example
 * const unsubscribe = subscribeToCampaigns((campaigns) => {
 *   console.log('Updated campaigns:', campaigns);
 * });
 *
 * // Later:
 * unsubscribe();
 */
export async function subscribeToCampaigns(
  callback: (campaigns: (Campaign & { id: string })[]) => void,
  limit: number = 20,
  cursor: DocumentSnapshot<any> | null = null
): Promise<() => void> {
  const m = await import('firebase/firestore');
  const { db } = await import('../firebase/config');

  if (!db) return () => {};

  // Clean up existing listener
  const cacheKey = `campaigns:${cursor?.id ?? 'root'}`;
  if (listenerCache.has(cacheKey)) {
    listenerCache.get(cacheKey)?.unsubscribe();
  }

  const constraints: any[] = [
    m.where('active', '==', true),
    m.orderBy('createdAt', 'desc'),
    m.limit(limit),
  ];

  if (cursor) {
    constraints.push(m.startAfter(cursor));
  }

  const q = m.query(m.collection(db, 'campaigns'), ...constraints);

  const unsubscribe = m.onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as (Campaign & { id: string })[];
      callback(items);
    },
    (error) => {
      console.error('[Campaigns] Listener error:', error);
      callback([]);
    }
  );

  listenerCache.set(cacheKey, { unsubscribe, lastTimestamp: Date.now() });

  return () => {
    unsubscribe();
    listenerCache.delete(cacheKey);
  };
}

/**
 * Get events with optional province filter (paginated)
 *
 * @example
 * const { items, cursor, hasMore } = await getEvents('ON', 20);
 * const next = await getEvents('ON', 20, cursor);
 */
export async function getEvents(
  province?: string,
  limit: number = 20,
  cursor: DocumentSnapshot<any> | null = null
): Promise<{
  items: (Event & { id: string })[];
  cursor: DocumentSnapshot<any> | null;
  hasMore: boolean;
}> {
  const m = await import('firebase/firestore');
  const { db } = await import('../firebase/config');

  if (!db) throw new Error('Firestore not initialized');

  const constraints: any[] = [];

  if (province) {
    constraints.push(m.where('province', '==', province));
  }

  constraints.push(m.orderBy('startDate', 'desc'));
  constraints.push(m.limit(limit + 1)); // +1 to detect more

  if (cursor) {
    constraints.push(m.startAfter(cursor));
  }

  const collectionName = process.env.EXPO_PUBLIC_DATA_POLICY === 'strict_byoc'
    ? 'events_preview'
    : 'events_production';

  const q = m.query(m.collection(db, collectionName), ...constraints);
  const snap = await m.getDocs(q);

  const hasMore = snap.docs.length > limit;
  const items = snap.docs.slice(0, limit).map((d) => ({
    id: d.id,
    ...d.data(),
  })) as (Event & { id: string })[];

  return {
    items,
    cursor: hasMore ? snap.docs[limit - 1] : null,
    hasMore,
  };
}

/**
 * Subscribe to events with real-time updates
 *
 * @example
 * const unsubscribe = subscribeToEvents((events) => {
 *   console.log('Updated events:', events);
 * }, 'ON');
 *
 * // Later:
 * unsubscribe();
 */
export async function subscribeToEvents(
  callback: (events: (Event & { id: string })[]) => void,
  province?: string,
  limit: number = 20,
  cursor: DocumentSnapshot<any> | null = null
): Promise<() => void> {
  const m = await import('firebase/firestore');
  const { db } = await import('../firebase/config');

  if (!db) return () => {};

  // Clean up existing listener
  const cacheKey = `events:${province}:${cursor?.id ?? 'root'}`;
  if (listenerCache.has(cacheKey)) {
    listenerCache.get(cacheKey)?.unsubscribe();
  }

  const constraints: any[] = [];

  if (province) {
    constraints.push(m.where('province', '==', province));
  }

  constraints.push(m.orderBy('startDate', 'desc'));
  constraints.push(m.limit(limit));

  if (cursor) {
    constraints.push(m.startAfter(cursor));
  }

  const collectionName = process.env.EXPO_PUBLIC_DATA_POLICY === 'strict_byoc'
    ? 'events_preview'
    : 'events_production';

  const q = m.query(m.collection(db, collectionName), ...constraints);

  const unsubscribe = m.onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as (Event & { id: string })[];
      callback(items);
    },
    (error) => {
      console.error('[Events] Listener error:', error);
      callback([]);
    }
  );

  listenerCache.set(cacheKey, { unsubscribe, lastTimestamp: Date.now() });

  return () => {
    unsubscribe();
    listenerCache.delete(cacheKey);
  };
}

/**
 * Get community messages for a specific channel (paginated)
 *
 * @example
 * const { items, cursor, hasMore } = await getCommunityMessages('general', 50);
 * const next = await getCommunityMessages('general', 50, cursor);
 */
export async function getCommunityMessages(
  channelId: string,
  limit: number = 50,
  cursor: DocumentSnapshot<any> | null = null
): Promise<{
  items: any[];
  cursor: DocumentSnapshot<any> | null;
  hasMore: boolean;
}> {
  const m = await import('firebase/firestore');
  const { db } = await import('../firebase/config');

  if (!db) throw new Error('Firestore not initialized');

  const constraints: any[] = [
    m.where('channel', '==', channelId),
    m.orderBy('createdAt', 'desc'),
    m.limit(limit + 1), // +1 to detect more
  ];

  if (cursor) {
    constraints.push(m.startAfter(cursor));
  }

  const q = m.query(m.collection(db, 'threads'), ...constraints);
  const snap = await m.getDocs(q);

  const hasMore = snap.docs.length > limit;
  const items = snap.docs.slice(0, limit).map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return {
    items,
    cursor: hasMore ? snap.docs[limit - 1] : null,
    hasMore,
  };
}

/**
 * Subscribe to community messages with real-time updates
 *
 * @example
 * const unsubscribe = subscribeToCommunityMessages('general', (messages) => {
 *   console.log('Updated messages:', messages);
 * });
 *
 * // Later:
 * unsubscribe();
 */
export async function subscribeToCommunityMessages(
  channelId: string,
  callback: (messages: any[]) => void,
  limit: number = 50,
  cursor: DocumentSnapshot<any> | null = null
): Promise<() => void> {
  const m = await import('firebase/firestore');
  const { db } = await import('../firebase/config');

  if (!db) return () => {};

  // Clean up existing listener
  const cacheKey = `community:${channelId}:${cursor?.id ?? 'root'}`;
  if (listenerCache.has(cacheKey)) {
    listenerCache.get(cacheKey)?.unsubscribe();
  }

  const constraints: any[] = [
    m.where('channel', '==', channelId),
    m.orderBy('createdAt', 'desc'),
    m.limit(limit),
  ];

  if (cursor) {
    constraints.push(m.startAfter(cursor));
  }

  const q = m.query(m.collection(db, 'threads'), ...constraints);

  const unsubscribe = m.onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(items);
    },
    (error) => {
      console.error('[Community] Listener error:', error);
      callback([]);
    }
  );

  listenerCache.set(cacheKey, { unsubscribe, lastTimestamp: Date.now() });

  return () => {
    unsubscribe();
    listenerCache.delete(cacheKey);
  };
}

/**
 * Clean up all active listeners (call on app unmount)
 */
export function cleanupAllListeners(): void {
  listenerCache.forEach(({ unsubscribe }) => {
    unsubscribe();
  });
  listenerCache.clear();
}

/**
 * Get listener statistics for debugging
 */
export function getListenerStats() {
  return {
    activeListeners: listenerCache.size,
    listeners: Array.from(listenerCache.entries()).map(([key, val]) => ({
      key,
      age: Date.now() - val.lastTimestamp,
    })),
  };
}
