/**
 * Firestore Pagination TypeScript Type Definitions
 * 
 * Type-safe interfaces for pagination queries and hooks
 */

import type { DocumentSnapshot } from 'firebase/firestore';

/**
 * Pagination result from any query
 */
export interface PaginationResult<T> {
  /** Items in this page */
  items: T[];
  /** Cursor for next page (null if no more items) */
  cursor: DocumentSnapshot<any> | null;
  /** Whether more items exist */
  hasMore: boolean;
  /** Number of items in this page */
  count: number;
}

/**
 * Hook state for usePaginatedQuery
 */
export interface UsePaginatedQueryResult<T> {
  /** Current page items */
  items: T[];
  /** Loading state for current/next page fetch */
  loading: boolean;
  /** Error from last failed operation */
  error: Error | null;
  /** Whether more pages available */
  hasMore: boolean;
  /** Load next page */
  loadMore: () => Promise<void>;
  /** Clear cache and reload from start */
  refresh: () => Promise<void>;
  /** Current cursor position (for debug) */
  cursor: DocumentSnapshot<any> | null;
}

/**
 * Hook options for usePaginatedQuery
 */
export interface UsePaginatedQueryOptions {
  /** Firestore collection name */
  collection: string;
  /** Field to order by */
  orderBy: string;
  /** Order direction (default: 'desc') */
  orderDirection?: 'asc' | 'desc';
  /** Additional where/filter constraints */
  constraints?: any[];
  /** Items per page (default: 20) */
  limit?: number;
  /** Cache key for cursor persistence (auto-generated if not provided) */
  cacheKey?: string;
  /** Enable/disable queries (default: true) */
  enabled?: boolean;
}

/**
 * Generic paginator returned by createPaginator
 */
export interface Paginator<T extends { id: string }> {
  /**
   * Fetch a page of documents
   */
  getPage(
    limit: number,
    cursor?: DocumentSnapshot<any> | null
  ): Promise<PaginationResult<T>>;

  /**
   * Clear cached cursor for this collection
   */
  clearCache(): void;

  /**
   * Get last cached cursor
   */
  getCachedCursor(): DocumentSnapshot<any> | null;
}

/**
 * Listener paginator with subscription support
 */
export interface ListenerPaginator<T extends { id: string }> {
  /**
   * Subscribe to collection with real-time updates
   */
  subscribe(
    callback: (result: PaginationResult<T>) => void,
    limit?: number,
    cursor?: DocumentSnapshot<any> | null
  ): () => void;

  /**
   * Stop listening
   */
  unsubscribe(): void;
}

/**
 * Cache entry for pagination state
 */
export interface PaginationCacheEntry {
  lastCursor: DocumentSnapshot<any> | null;
  lastTimestamp: number;
}

/**
 * Statistics for pagination cache
 */
export interface PaginationStats {
  cachedCollections: number;
  entries: Array<{
    key: string;
    cacheAge: number;
  }>;
}

/**
 * Statistics for active listeners
 */
export interface ListenerStats {
  activeListeners: number;
  listeners: Array<{
    key: string;
    age: number;
  }>;
}

/**
 * Campaign type (from models)
 */
export interface CampaignWithId {
  id: string;
  title: string;
  summary: string;
  active: boolean;
  createdAt: number;
  createdBy?: string;
  target?: string;
  goalCount?: number;
  contactEmail?: string;
  membersCount?: number;
}

/**
 * Event type (from models)
 */
export interface EventWithId {
  id: string;
  title: string;
  description?: string;
  startDate: number;
  endDate?: number;
  province?: string;
  status: 'published' | 'draft';
  createdBy: string;
  createdAt: number;
  location?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Community message/thread type
 */
export interface ThreadWithId {
  id: string;
  channel: string;
  title: string;
  content: string;
  authorUid: string;
  createdAt: number;
  updatedAt?: number;
  likes?: number;
  replies?: number;
}

/**
 * Listener cache entry
 */
export interface ActiveListener {
  key: string;
  unsubscribe: () => void;
  lastTimestamp: number;
}

/**
 * Options for createPaginator
 */
export interface CreatePaginatorOptions {
  collection: string;
  orderBy: string;
  orderDirection?: 'asc' | 'desc';
  constraints?: any[];
  cacheKey?: string;
}

/**
 * Options for createListenerPaginator
 */
export interface CreateListenerPaginatorOptions {
  collection: string;
  orderBy: string;
  orderDirection?: 'asc' | 'desc';
  constraints?: any[];
}

/**
 * Batch fetch result
 */
export interface BatchFetchResult<T extends { id: string }> {
  items: T[];
  cursors: (DocumentSnapshot<any> | null)[];
}

/**
 * Query function options for getCampaigns
 */
export interface GetCampaignsOptions {
  limit?: number;
  cursor?: DocumentSnapshot<any> | null;
}

/**
 * Query function options for getEvents
 */
export interface GetEventsOptions {
  province?: string;
  limit?: number;
  cursor?: DocumentSnapshot<any> | null;
}

/**
 * Query function options for getCommunityMessages
 */
export interface GetCommunityMessagesOptions {
  channelId: string;
  limit?: number;
  cursor?: DocumentSnapshot<any> | null;
}

/**
 * Subscription function options
 */
export interface SubscriptionOptions<T extends { id: string }> {
  callback: (items: T[]) => void;
  limit?: number;
  cursor?: DocumentSnapshot<any> | null;
}

// Export type helpers
export type Nullable<T> = T | null;
export type AsyncFunction<T> = () => Promise<T>;
export type UnsubscribeFn = () => void;
