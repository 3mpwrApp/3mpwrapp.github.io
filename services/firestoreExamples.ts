/**
 * Updated Service Functions with Firestore Pagination
 * 
 * These are examples showing how to integrate the firestorePagination service
 * into existing services. Copy patterns to your actual service files.
 */

import type { DocumentSnapshot } from 'firebase/firestore';

import { getCampaignsPaginator, getCommunityPaginator, getEventsPaginator } from './firestorePagination';

// ============================================================================
// EXAMPLE 1: Campaigns Service with Pagination
// ============================================================================

export async function listCampaignsPaginated(limit: number = 20, cursor?: DocumentSnapshot<any>) {
  try {
    const paginator = await getCampaignsPaginator();
    const result = await paginator.getPage(limit, cursor);
    return result;
  } catch (error) {
    console.error('[Campaigns] Pagination error:', error);
    return { items: [], cursor: null, hasMore: false, count: 0 };
  }
}

/**
 * Subscribe to active campaigns with real-time updates and pagination
 * IMPORTANT: Store the returned unsubscribe function and call it on cleanup
 */
export async function subscribeToCampaigns(
  onData: (data: any) => void,
  limit: number = 20,
  onError?: (error: Error) => void
) {
  try {
    const m = await import('firebase/firestore');
    const { db } = await import('../firebase/config');

    if (!db) return () => {};

    const constraints = [
      m.where('active', '==', true),
      m.orderBy('createdAt', 'desc'),
      m.limit(limit),
    ];

    const q = m.query(m.collection(db, 'campaigns'), ...constraints);

    // This is the listener - MUST be cleaned up in useEffect return or component unmount
    const unsubscribe = m.onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        onData(items);
      },
      (error) => {
        console.error('[Campaigns] Listener error:', error);
        if (onError) onError(error as Error);
      }
    );

    // CRITICAL: Return this function for cleanup
    return unsubscribe;
  } catch (error) {
    console.error('[Campaigns] Subscribe error:', error);
    return () => {};
  }
}

// ============================================================================
// EXAMPLE 2: Events Service with Province Filter + Pagination
// ============================================================================

export async function listEventsByProvincePaginated(
  province: string,
  limit: number = 20,
  cursor?: DocumentSnapshot<any>
) {
  try {
    const paginator = await getEventsPaginator(province);
    const result = await paginator.getPage(limit, cursor);
    return result;
  } catch (error) {
    console.error('[Events] Pagination error:', error);
    return { items: [], cursor: null, hasMore: false, count: 0 };
  }
}

/**
 * Subscribe to events in a province with real-time updates
 * IMPORTANT: Store the returned unsubscribe function and call it on cleanup
 */
export async function subscribeToEventsByProvince(
  province: string,
  onData: (data: any) => void,
  limit: number = 20,
  onError?: (error: Error) => void
) {
  try {
    const m = await import('firebase/firestore');
    const { db } = await import('../firebase/config');

    if (!db) return () => {};

    const constraints = [
      m.where('province', '==', province),
      m.orderBy('startDate', 'desc'),
      m.limit(limit),
    ];

    const q = m.query(m.collection(db, 'events'), ...constraints);

    // CRITICAL: This listener must be cleaned up
    const unsubscribe = m.onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        onData(items);
      },
      (error) => {
        console.error('[Events] Listener error:', error);
        if (onError) onError(error as Error);
      }
    );

    // CRITICAL: Return this function for cleanup
    return unsubscribe;
  } catch (error) {
    console.error('[Events] Subscribe error:', error);
    return () => {};
  }
}

// ============================================================================
// EXAMPLE 3: Community Service with Pagination
// ============================================================================

export async function listCommunityMessagesPaginated(
  channel: string,
  limit: number = 50,
  cursor?: DocumentSnapshot<any>
) {
  try {
    const paginator = await getCommunityPaginator(channel);
    const result = await paginator.getPage(limit, cursor);
    return result;
  } catch (error) {
    console.error('[Community] Pagination error:', error);
    return { items: [], cursor: null, hasMore: false, count: 0 };
  }
}

/**
 * Subscribe to community messages in a channel
 * IMPORTANT: Store the returned unsubscribe function and call it on cleanup
 */
export async function subscribeToCommunitMessages(
  channel: string,
  onData: (data: any) => void,
  limit: number = 50,
  onError?: (error: Error) => void
) {
  try {
    const m = await import('firebase/firestore');
    const { db } = await import('../firebase/config');

    if (!db) return () => {};

    const constraints = [
      m.where('channel', '==', channel),
      m.orderBy('createdAt', 'desc'),
      m.limit(limit),
    ];

    const q = m.query(m.collection(db, 'threads'), ...constraints);

    // CRITICAL: This listener must be cleaned up
    const unsubscribe = m.onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        onData(items);
      },
      (error) => {
        console.error('[Community] Listener error:', error);
        if (onError) onError(error as Error);
      }
    );

    // CRITICAL: Return this function for cleanup
    return unsubscribe;
  } catch (error) {
    console.error('[Community] Subscribe error:', error);
    return () => {};
  }
}

// ============================================================================
// EXAMPLE 4: How to Use in React Components
// ============================================================================

/**
 * EXAMPLE React Hook Pattern:
 * 
 * function CampaignsListScreen() {
 *   const [campaigns, setCampaigns] = useState([]);
 *   const [cursor, setCursor] = useState<DocumentSnapshot<any> | null>(null);
 *   const [loading, setLoading] = useState(false);
 *
 *   // Subscribe to campaigns on mount
 *   useEffect(() => {
 *     setLoading(true);
 *     
 *     // THIS IS THE KEY PART: Store unsubscribe function
 *     const unsubscribe = await subscribeToCampaigns(
 *       (data) => {
 *         setCampaigns(data);
 *         setLoading(false);
 *       },
 *       20 // limit per page
 *     );
 *
 *     // CLEANUP: Call unsubscribe when component unmounts
 *     return () => {
 *       unsubscribe(); // This prevents memory leaks
 *     };
 *   }, []);
 *
 *   const handleLoadMore = async () => {
 *     const next = await listCampaignsPaginated(20, cursor);
 *     setCampaigns(prev => [...prev, ...next.items]);
 *     setCursor(next.cursor);
 *   };
 *
 *   return (
 *     <View>
 *       {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
 *       {cursor && <Button onPress={handleLoadMore}>Load More</Button>}
 *     </View>
 *   );
 * }
 */

// ============================================================================
// EXAMPLE 5: Listener Leak Detection / Cleanup Helper
// ============================================================================

/**
 * Use this in your app shell to track active listeners
 * Helps detect listener leaks during development
 */
export class FirestoreListenerManager {
  private listeners: Map<string, { unsubscribe: () => void; created: number }> = new Map();

  subscribe(name: string, unsubscribe: () => void): () => void {
    const id = `${name}_${Date.now()}`;
    this.listeners.set(id, { unsubscribe, created: Date.now() });

    // Log active listeners
    console.warn(`[Firestore] Subscribed: ${name} (total: ${this.listeners.size})`);

    // Return a cleanup wrapper
    return () => {
      unsubscribe();
      this.listeners.delete(id);
      console.warn(`[Firestore] Unsubscribed: ${name} (remaining: ${this.listeners.size})`);
    };
  }

  getStatus() {
    const now = Date.now();
    return {
      activeListeners: this.listeners.size,
      listeners: Array.from(this.listeners.entries()).map(([id, { created }]) => ({
        id,
        ageMs: now - created,
      })),
    };
  }

  unsubscribeAll() {
    console.warn(`[Firestore] Cleaning up ${this.listeners.size} listeners...`);
    this.listeners.forEach(({ unsubscribe }) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('[Firestore] Cleanup error:', error);
      }
    });
    this.listeners.clear();
  }
}

// Export singleton instance
export const listenerManager = new FirestoreListenerManager();

// ============================================================================
// EXAMPLE 6: Recommended Implementation Pattern for React Components
// ============================================================================

/**
 * RECOMMENDED PATTERN:
 * 
 * import { useEffect, useState } from 'react';
 * import { subscribeToCampaigns, listenerManager } from '@/services/firestoreExamples';
 * 
 * export function CampaignsList() {
 *   const [campaigns, setCampaigns] = useState([]);
 *   const [error, setError] = useState<Error | null>(null);
 *   const [isLoading, setIsLoading] = useState(true);
 *
 *   useEffect(() => {
 *     setIsLoading(true);
 *
 *     // Create a promise to handle async subscribe
 *     const setupListener = async () => {
 *       try {
 *         const unsubscribe = await subscribeToCampaigns(
 *           (data) => {
 *             setCampaigns(data);
 *             setIsLoading(false);
 *           },
 *           20, // limit
 *           (err) => setError(err)
 *         );
 *
 *         // Track the listener for debugging
 *         return listenerManager.subscribe('campaigns', unsubscribe);
 *       } catch (err) {
 *         setError(err as Error);
 *         setIsLoading(false);
 *       }
 *     };
 *
 *     const cleanupPromise = setupListener();
 *
 *     // Cleanup when component unmounts
 *     return () => {
 *       cleanupPromise.then(cleanup => cleanup?.());
 *     };
 *   }, []);
 *
 *   if (isLoading) return <Text>Loading...</Text>;
 *   if (error) return <Text>Error: {error.message}</Text>;
 *
 *   return (
 *     <FlatList
 *       data={campaigns}
 *       renderItem={({ item }) => <CampaignCard campaign={item} />}
 *       keyExtractor={(item) => item.id}
 *     />
 *   );
 * }
 */
