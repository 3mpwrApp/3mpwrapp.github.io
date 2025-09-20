import { podcasts as local } from "../data/podcasts";
import type { Podcast } from "../data/podcasts";
import { retry } from "./api";
import { fetchInjuredWorkerVideos } from "./youtube";
import { getCachedJSON, setCachedJSON } from "./cache";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";
const HAS_YT = !!process.env.EXPO_PUBLIC_YT_API_KEY;
const CACHE_KEY = "podcasts:v1";

export const fetchPodcasts = async (): Promise<Podcast[]> => {
  // Priority: API (if configured) -> YouTube (if API key set) -> local
  // 1) Try remote API if provided
  if (BASE) {
    try {
      const data = await retry(async () =>
        (await fetch(`${BASE}/podcasts`)).json(),
      );
      if (Array.isArray(data) && data.length) {
        setCachedJSON(CACHE_KEY, data).catch(() => {});
        return data as Podcast[];
      }
    } catch {}
  }

  // 2) Try YouTube aggregation if key is available
  if (HAS_YT) {
    try {
      const data = await fetchInjuredWorkerVideos(30);
      if (data.length) {
        setCachedJSON(CACHE_KEY, data).catch(() => {});
        return data;
      }
    } catch {}
  }

  // 2.5) Try cache
  const cached = await getCachedJSON<Podcast[]>(CACHE_KEY);
  if (cached?.length) return cached;

  // 3) Fallback to local bundled data
  return local;
};
