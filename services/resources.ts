import { resources as local } from "../data/resources";
import type { Resource } from "../types/models";

import { retry } from "./api";
import { getCachedJSON, setCachedJSON } from "./cache";
import {
  measurePerformance,
  captureException,
  addBreadcrumb,
  setMeasurement,
} from "./sentryLabeling";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";
const CACHE_KEY = "resources:v1";

export async function fetchResources(): Promise<Resource[]> {
  return await measurePerformance(
    'fetch_resources',
    async () => {
      addBreadcrumb('Starting resources fetch', 'resources', 'info');

      // Try remote API
      if (BASE) {
        try {
          addBreadcrumb('Attempting to fetch from API', 'resources', 'info');
          const data = await retry(async () => {
            const res = await fetch(`${BASE}/resources`);
            if (!res.ok && res.status === 404) {
              // Silently fail on 404 (expected in dev mode)
              throw new Error('Not found');
            }
            return res.json();
          });
          if (Array.isArray(data) && data.length) {
            setMeasurement('resources_count', data.length, 'none');
            setMeasurement('resources_source', 1, 'none'); // 1 = API
            addBreadcrumb(`Fetched ${data.length} resources from API`, 'resources', 'info');
            setCachedJSON(CACHE_KEY, data).catch(() => {});
            return data as Resource[];
          }
        } catch (error) {
          addBreadcrumb('API fetch failed, trying cache', 'resources', 'warning');
          captureException(error as Error, {
            feature: 'resources',
            severity: 'warning',
            tags: { operation: 'fetch_api' },
          });
        }
      }

      // Try cache
      const cached = await getCachedJSON<Resource[]>(CACHE_KEY);
      if (cached?.length) {
        setMeasurement('resources_count', cached.length, 'none');
        setMeasurement('resources_source', 2, 'none'); // 2 = Cache
        addBreadcrumb(`Using ${cached.length} resources from cache`, 'resources', 'info');
        return cached;
      }

      // Fallback local
      setMeasurement('resources_count', local.length, 'none');
      setMeasurement('resources_source', 3, 'none'); // 3 = Local
      addBreadcrumb(`Using ${local.length} local resources (fallback)`, 'resources', 'info');
      return local;
    },
    {
      op: 'http.client',
      tags: { feature: 'resources' },
    }
  );
}
