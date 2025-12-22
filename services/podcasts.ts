import type { Podcast } from "../data/podcasts";
import { podcasts as local } from "../data/podcasts";

import { retry } from "./api";
import { getCachedJSON, setCachedJSON } from "./cache";
import { fetchInjuredWorkerVideos } from "./youtube";
import {
  measurePerformance,
  startSpan,
  captureException,
  addBreadcrumb,
  setMeasurement,
} from "./sentryLabeling";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";
const HAS_YT = !!process.env.EXPO_PUBLIC_YT_API_KEY;
const CACHE_KEY = "podcasts:v1";

export const fetchPodcasts = async (): Promise<Podcast[]> => {
  return await measurePerformance(
    'fetch_podcasts',
    async () => {
      addBreadcrumb('Starting podcast fetch', 'podcasts', 'info');

      // Priority: API (if configured) -> YouTube (if API key set) -> Cache -> local
      // 1) Try remote API if provided
      if (BASE) {
        try {
          addBreadcrumb('Attempting to fetch from API', 'podcasts', 'info');
          const data = await retry(async () => {
            const res = await fetch(`${BASE}/podcasts`);
            if (!res.ok && res.status === 404) {
              // Silently fail on 404 (expected in dev mode)
              throw new Error('Not found');
            }
            return res.json();
          });
          if (Array.isArray(data) && data.length) {
            setMeasurement('podcasts_count', data.length, 'none');
            setMeasurement('podcasts_source', 1, 'none'); // 1 = API
            addBreadcrumb(`Fetched ${data.length} podcasts from API`, 'podcasts', 'info');
            setCachedJSON(CACHE_KEY, data).catch(() => {});
            return data as Podcast[];
          }
        } catch (error) {
          addBreadcrumb('API fetch failed, trying YouTube', 'podcasts', 'warning');
          captureException(error as Error, {
            feature: 'podcasts',
            severity: 'warning',
            tags: { operation: 'fetch_api' },
          });
        }
      }

      // 2) Try YouTube aggregation if key is available
      if (HAS_YT) {
        try {
          addBreadcrumb('Attempting to fetch from YouTube', 'podcasts', 'info');
          const data = await fetchInjuredWorkerVideos(30);
          if (data.length) {
            setMeasurement('podcasts_count', data.length, 'none');
            setMeasurement('podcasts_source', 2, 'none'); // 2 = YouTube
            addBreadcrumb(`Fetched ${data.length} podcasts from YouTube`, 'podcasts', 'info');
            setCachedJSON(CACHE_KEY, data).catch(() => {});
            return data;
          }
        } catch (error) {
          addBreadcrumb('YouTube fetch failed, trying cache', 'podcasts', 'warning');
          captureException(error as Error, {
            feature: 'podcasts',
            severity: 'warning',
            tags: { operation: 'fetch_youtube' },
          });
        }
      }

      // 2.5) Try cache
      const cached = await getCachedJSON<Podcast[]>(CACHE_KEY);
      if (cached?.length) {
        setMeasurement('podcasts_count', cached.length, 'none');
        setMeasurement('podcasts_source', 3, 'none'); // 3 = Cache
        addBreadcrumb(`Using ${cached.length} podcasts from cache`, 'podcasts', 'info');
        return cached;
      }

      // 3) Fallback to local bundled data
      setMeasurement('podcasts_count', local.length, 'none');
      setMeasurement('podcasts_source', 4, 'none'); // 4 = Local
      addBreadcrumb(`Using ${local.length} local podcasts (fallback)`, 'podcasts', 'info');
      return local;
    },
    {
      op: 'http.client',
      tags: { feature: 'podcasts' },
    }
  );
};
