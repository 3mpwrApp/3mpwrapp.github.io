import type { Faq } from '../data/faqs';
import { getFaqs } from '../data/faqs';
import { listJurisdictions } from '../data/jurisdictions';
import { resources } from '../data/resources';
import type { JurisdictionData } from '../types/jurisdiction';
import type { Resource } from '../types/models';

interface LazyLoadCache<T> {
  data: T[] | null;
  loaded: boolean;
  loading: boolean;
  error: Error | null;
  timestamp: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const lazyDataCache: Record<string, LazyLoadCache<any>> = {
  faqs: {
    data: null,
    loaded: false,
    loading: false,
    error: null,
    timestamp: 0,
  },
  jurisdictions: {
    data: null,
    loaded: false,
    loading: false,
    error: null,
    timestamp: 0,
  },
  resources: {
    data: null,
    loaded: false,
    loading: false,
    error: null,
    timestamp: 0,
  },
};

/**
 * Lazy load FAQ data on demand
 * Returns cached data if available and fresh
 */
export async function lazyLoadFAQs(): Promise<Faq[]> {
  const cache = lazyDataCache.faqs;

  // Return cached data if fresh
  if (
    cache.loaded &&
    cache.data &&
    Date.now() - cache.timestamp < CACHE_TTL
  ) {
    return cache.data;
  }

  // Prevent concurrent requests
  if (cache.loading) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!cache.loading) {
          clearInterval(checkInterval);
          resolve(cache.data || []);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('FAQ loading timeout'));
      }, 5000);
    });
  }

  cache.loading = true;
  try {
    const faqs = await getFaqs();
    cache.data = faqs;
    cache.loaded = true;
    cache.error = null;
    cache.timestamp = Date.now();
    return faqs;
  } catch (error) {
    cache.error = error instanceof Error ? error : new Error(String(error));
    throw cache.error;
  } finally {
    cache.loading = false;
  }
}

/**
 * Lazy load jurisdiction data on demand
 * Returns cached data if available and fresh
 */
export async function lazyLoadJurisdictions(): Promise<JurisdictionData[]> {
  const cache = lazyDataCache.jurisdictions;

  // Return cached data if fresh
  if (
    cache.loaded &&
    cache.data &&
    Date.now() - cache.timestamp < CACHE_TTL
  ) {
    return cache.data;
  }

  // Prevent concurrent requests
  if (cache.loading) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!cache.loading) {
          clearInterval(checkInterval);
          resolve(cache.data || []);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Jurisdiction loading timeout'));
      }, 5000);
    });
  }

  cache.loading = true;
  try {
    const jurisdictions = listJurisdictions();
    cache.data = jurisdictions;
    cache.loaded = true;
    cache.error = null;
    cache.timestamp = Date.now();
    return jurisdictions;
  } catch (error) {
    cache.error = error instanceof Error ? error : new Error(String(error));
    throw cache.error;
  } finally {
    cache.loading = false;
  }
}

/**
 * Lazy load resource data on demand
 * Returns cached data if available and fresh
 */
export async function lazyLoadResources(): Promise<Resource[]> {
  const cache = lazyDataCache.resources;

  // Return cached data if fresh
  if (
    cache.loaded &&
    cache.data &&
    Date.now() - cache.timestamp < CACHE_TTL
  ) {
    return cache.data;
  }

  // Prevent concurrent requests
  if (cache.loading) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!cache.loading) {
          clearInterval(checkInterval);
          resolve(cache.data || []);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Resource loading timeout'));
      }, 5000);
    });
  }

  cache.loading = true;
  try {
    // Simulate async operation to match lazyLoadFAQs and lazyLoadJurisdictions patterns
    await new Promise(resolve => setTimeout(resolve, 0));
    cache.data = resources;
    cache.loaded = true;
    cache.error = null;
    cache.timestamp = Date.now();
    return resources;
  } catch (error) {
    cache.error = error instanceof Error ? error : new Error(String(error));
    throw cache.error;
  } finally {
    cache.loading = false;
  }
}

/**
 * Prefetch all lazy-loadable data
 */
export async function prefetchAllLazyData(): Promise<void> {
  await Promise.all([
    lazyLoadFAQs(),
    lazyLoadJurisdictions(),
    lazyLoadResources(),
  ]);
}

/**
 * Clear specific or all lazy-loaded data cache
 */
export function clearLazyCache(type?: 'faqs' | 'jurisdictions' | 'resources'): void {
  if (type) {
    const cache = lazyDataCache[type];
    if (cache) {
      cache.data = null;
      cache.loaded = false;
      cache.error = null;
      cache.timestamp = 0;
    }
  } else {
    Object.keys(lazyDataCache).forEach(key => {
      lazyDataCache[key] = {
        data: null,
        loaded: false,
        loading: false,
        error: null,
        timestamp: 0,
      };
    });
  }
}

/**
 * Get cache status for all lazy-loaded data
 */
export function getLazyCacheStatus(): Record<
  string,
  { loaded: boolean; loading: boolean; error: Error | null; age: number }
> {
  return Object.entries(lazyDataCache).reduce(
    (acc, [key, cache]) => {
      acc[key] = {
        loaded: cache.loaded,
        loading: cache.loading,
        error: cache.error,
        age: cache.loaded ? Date.now() - cache.timestamp : -1,
      };
      return acc;
    },
    {} as Record<
      string,
      { loaded: boolean; loading: boolean; error: Error | null; age: number }
    >
  );
}
