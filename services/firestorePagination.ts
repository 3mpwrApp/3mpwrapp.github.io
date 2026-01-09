/**
 * Firestore Pagination Service
 * 
 * Provides reusable pagination utilities for Firestore queries with proper
 * listener cleanup, cursor-based pagination, and configurable limits.
 * 
 * Usage:
 *   const paginator = createPaginator({ collection: 'campaigns', orderBy: 'createdAt' });
 *   const page1 = await paginator.getPage(20);
 *   const page2 = await paginator.getPage(20, page1.cursor);
 *
 * React Hook Usage:
 *   const { items, loading, error, hasMore, loadMore } = usePaginatedQuery({
 *     collection: 'campaigns',
 *     orderBy: 'createdAt',
 *     limit: 20
 *   });
 */

import type { DocumentSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Pagination result with items and cursor for next page
 */
export interface PaginationResult<T> {
  items: T[];
  cursor: DocumentSnapshot<any> | null;
  hasMore: boolean;
  count: number;
}

/**
 * Paginator state cache to avoid re-querying
 */
const paginationCache = new Map<string, { lastCursor: DocumentSnapshot<any> | null; lastTimestamp: number }>();

/**
 * Create a paginator for a collection
 * 
 * @example
 * const paginator = createPaginator({
 *   collection: 'campaigns',
 *   orderBy: 'createdAt',
 *   constraints: [where('active', '==', true)]
 * });
 */
export async function createPaginator(opts: {
  collection: string;
  orderBy: string;
  orderDirection?: 'asc' | 'desc';
  constraints?: any[];
  cacheKey?: string;
}) {
  const m = await import('firebase/firestore');
  const { db } = await import('../firebase/config');

  const cacheKey = opts.cacheKey || `${opts.collection}:${opts.orderBy}`;
  const orderDir = opts.orderDirection || 'desc';

  return {
    /**
     * Get a page of documents
     */
    async getPage(
      limit: number = 20,
      cursor: DocumentSnapshot<any> | null = null
    ): Promise<PaginationResult<any>> {
      if (!db) throw new Error('Firestore not initialized');

      const constraints: any[] = [...(opts.constraints || [])];
      constraints.push(m.orderBy(opts.orderBy, orderDir));
      constraints.push(m.limit(limit + 1)); // +1 to detect if more results exist

      if (cursor) {
        constraints.push(m.startAfter(cursor));
      }

      const q = m.query(m.collection(db, opts.collection), ...constraints);
      const snap = await m.getDocs(q);

      const hasMore = snap.docs.length > limit;
      const items = snap.docs.slice(0, limit).map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const nextCursor = hasMore ? snap.docs[limit - 1] : null;

      // Cache cursor for this collection
      paginationCache.set(cacheKey, {
        lastCursor: nextCursor,
        lastTimestamp: Date.now(),
      });

      return {
        items,
        cursor: nextCursor,
        hasMore,
        count: items.length,
      };
    },

    /**
     * Clear cached cursor for this collection
     */
    clearCache() {
      paginationCache.delete(cacheKey);
    },

    /**
     * Get the last cached cursor
     */
    getCachedCursor(): DocumentSnapshot<any> | null {
      const cached = paginationCache.get(cacheKey);
      return cached ? cached.lastCursor : null;
    },
  };
}

/**
 * Create a listener-based paginator with automatic cleanup
 * 
 * @example
 * const { subscribe, unsubscribe } = createListenerPaginator({
 *   collection: 'campaigns',
 *   orderBy: 'createdAt'
 * });
 * 
 * const unsubscribe = subscribe(
 *   (data) => console.log(data),
 *   20 // limit
 * );
 * 
 * // Later:
 * unsubscribe();
 */
export async function createListenerPaginator(opts: {
  collection: string;
  orderBy: string;
  orderDirection?: 'asc' | 'desc';
  constraints?: any[];
}) {
  const m = await import('firebase/firestore');
  const { db } = await import('../firebase/config');

  const orderDir = opts.orderDirection || 'desc';
  let currentUnsubscribe: (() => void) | null = null;

  return {
    /**
     * Subscribe to collection with pagination
     */
    subscribe(
      callback: (result: PaginationResult<any>) => void,
      limit: number = 20,
      cursor: DocumentSnapshot<any> | null = null
    ): () => void {
      if (!db) return () => {};

      // Clean up previous listener
      if (currentUnsubscribe) {
        currentUnsubscribe();
      }

      const constraints: any[] = [...(opts.constraints || [])];
      constraints.push(m.orderBy(opts.orderBy, orderDir));
      constraints.push(m.limit(limit + 1));

      if (cursor) {
        constraints.push(m.startAfter(cursor));
      }

      const q = m.query(m.collection(db, opts.collection), ...constraints);

      currentUnsubscribe = m.onSnapshot(
        q,
        (snap) => {
          const hasMore = snap.docs.length > limit;
          const items = snap.docs.slice(0, limit).map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          const nextCursor = hasMore ? snap.docs[limit - 1] : null;

          callback({
            items,
            cursor: nextCursor,
            hasMore,
            count: items.length,
          });
        },
        (error) => {
          console.error(`[Pagination] Listener error for ${opts.collection}:`, error);
          callback({
            items: [],
            cursor: null,
            hasMore: false,
            count: 0,
          });
        }
      );

      return () => {
        if (currentUnsubscribe) {
          currentUnsubscribe();
          currentUnsubscribe = null;
        }
      };
    },

    /**
     * Stop listening
     */
    unsubscribe() {
      if (currentUnsubscribe) {
        currentUnsubscribe();
        currentUnsubscribe = null;
      }
    },
  };
}

/**
 * Specialized paginator for campaigns
 */
export async function getCampaignsPaginator() {
  return createPaginator({
    collection: 'campaigns',
    orderBy: 'createdAt',
    orderDirection: 'desc',
    constraints: [
      (await import('firebase/firestore')).where('active', '==', true),
    ],
    cacheKey: 'campaigns:active',
  });
}

/**
 * Specialized paginator for events (with province filter)
 */
export async function getEventsPaginator(province?: string) {
  const constraints = [];
  if (province) {
    constraints.push(
      (await import('firebase/firestore')).where('province', '==', province)
    );
  }

  return createPaginator({
    collection: 'events',
    orderBy: 'startDate',
    orderDirection: 'desc',
    constraints,
    cacheKey: `events:${province || 'all'}`,
  });
}

/**
 * Specialized paginator for community messages
 */
export async function getCommunityPaginator(channel: string) {
  return createPaginator({
    collection: 'threads',
    orderBy: 'createdAt',
    orderDirection: 'desc',
    constraints: [
      (await import('firebase/firestore')).where('channel', '==', channel),
    ],
    cacheKey: `community:${channel}`,
  });
}

/**
 * Batch fetch with pagination - useful for initial load + pagination
 * 
 * @example
 * const batches = await batchFetch('campaigns', 3, 20);
 * // Fetches 3 batches of 20 items each = 60 items total
 */
export async function batchFetch(
  collection: string,
  numBatches: number = 1,
  pageSize: number = 20,
  constraints: any[] = []
): Promise<{ items: any[]; cursors: (DocumentSnapshot<any> | null)[] }> {
  const m = await import('firebase/firestore');
  const { db } = await import('../firebase/config');

  if (!db) throw new Error('Firestore not initialized');

  const items: any[] = [];
  const cursors: (DocumentSnapshot<any> | null)[] = [];

  let cursor: DocumentSnapshot<any> | null = null;

  for (let i = 0; i < numBatches; i++) {
    const queryConstraints: any[] = [...constraints];
    queryConstraints.push(m.orderBy('createdAt', 'desc'));
    queryConstraints.push(m.limit(pageSize + 1));

    if (cursor) {
      queryConstraints.push(m.startAfter(cursor));
    }

    const q = m.query(m.collection(db, collection), ...queryConstraints);
    const snap = await m.getDocs(q);

    if (snap.docs.length === 0) break;

    const hasMore = snap.docs.length > pageSize;
    const batchItems = snap.docs.slice(0, pageSize);
    items.push(...batchItems.map((d) => ({ id: d.id, ...d.data() })));

    cursor = hasMore ? snap.docs[pageSize - 1] : null;
    cursors.push(cursor);

    if (!hasMore) break;
  }

  return { items, cursors };
}

/**
 * Clear all pagination caches
 */
export function clearPaginationCache() {
  paginationCache.clear();
}

/**
 * Get cache statistics
 */
export function getPaginationStats() {
  return {
    cachedCollections: paginationCache.size,
    entries: Array.from(paginationCache.entries()).map(([key, val]) => ({
      key,
      cacheAge: Date.now() - val.lastTimestamp,
    })),
  };
}

/**
 * React Hook for paginated queries with automatic cleanup
 * 
 * @example
 * const { items, loading, error, hasMore, loadMore } = usePaginatedQuery({
 *   collection: 'campaigns',
 *   orderBy: 'createdAt',
 *   constraints: [where('active', '==', true)],
 *   limit: 20
 * });
 * 
 * return (
 *   <>
 *     {items.map(item => <div key={item.id}>{item.title}</div>)}
 *     {hasMore && <button onClick={loadMore}>Load More</button>}
 *   </>
 * );
 */
export function usePaginatedQuery<T extends { id: string }>(opts: {
  collection: string;
  orderBy: string;
  orderDirection?: 'asc' | 'desc';
  constraints?: any[];
  limit?: number;
  cacheKey?: string;
  enabled?: boolean;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const paginatorRef = useRef<Awaited<ReturnType<typeof createPaginator>> | null>(null);
  const cursorRef = useRef<DocumentSnapshot<any> | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  const limit = opts.limit ?? 20;

  // Initialize paginator
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const paginator = await createPaginator({
          collection: opts.collection,
          orderBy: opts.orderBy,
          orderDirection: opts.orderDirection,
          constraints: opts.constraints,
          cacheKey: opts.cacheKey,
        });
        if (mounted) {
          paginatorRef.current = paginator;
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize paginator'));
        }
      }
    };

    if (opts.enabled !== false) {
      init();
    }

    return () => {
      mounted = false;
    };
  }, [opts.collection, opts.orderBy, opts.orderDirection, opts.constraints, opts.cacheKey, opts.enabled]);

  // Load initial page
  useEffect(() => {
    if (!paginatorRef.current || opts.enabled === false) return;

    let mounted = true;

    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await paginatorRef.current!.getPage(limit);
        if (mounted) {
          setItems(result.items as T[]);
          cursorRef.current = result.cursor;
          setHasMore(result.hasMore);
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error('Failed to load page');
          setError(error);
          setItems([]);
          setHasMore(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      mounted = false;
    };
  }, [paginatorRef, limit, opts.enabled]);

  // Load more handler
  const loadMore = useCallback(async () => {
    if (!paginatorRef.current || !cursorRef.current || loading) return;

    setLoading(true);
    setError(null);
    try {
      const result = await paginatorRef.current.getPage(limit, cursorRef.current);
      setItems((prev) => [...prev, ...result.items] as T[]);
      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load more');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [limit, loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
    };
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    cursor: cursorRef.current,
    refresh: async () => {
      if (!paginatorRef.current) return;
      paginatorRef.current.clearCache();
      cursorRef.current = null;
      const result = await paginatorRef.current.getPage(limit);
      setItems(result.items as T[]);
      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
    },
  };
}
