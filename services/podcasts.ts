import { retry } from "./api";
import { podcasts as local } from "../data/podcasts";
import type { Podcast } from "../data/podcasts";
import { fetchInjuredWorkerVideos } from "./youtube";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";
const HAS_YT = !!process.env.EXPO_PUBLIC_YT_API_KEY;

export const fetchPodcasts = async (): Promise<Podcast[]> => {
  // Priority: API (if configured) -> YouTube (if API key set) -> local
  // 1) Try remote API if provided
  if (BASE) {
    try {
      const data = await retry(async () => (await fetch(`${BASE}/podcasts`)).json());
      if (Array.isArray(data)) return data as Podcast[];
    } catch {}
  }

  // 2) Try YouTube aggregation if key is available
  if (HAS_YT) {
    try {
      const data = await fetchInjuredWorkerVideos(30);
      if (data.length) return data;
    } catch {}
  }

  // 3) Fallback to local bundled data
  return local;
};
