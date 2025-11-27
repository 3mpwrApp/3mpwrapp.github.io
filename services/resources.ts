import { resources as local } from "../data/resources";
import type { Resource } from "../types/models";

import { retry } from "./api";
import { getCachedJSON, setCachedJSON } from "./cache";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";
const CACHE_KEY = "resources:v1";

export async function fetchResources(): Promise<Resource[]> {
  // Try remote API
  if (BASE) {
    try {
      const data = await retry(async () => {
        const res = await fetch(`${BASE}/resources`);
        if (!res.ok && res.status === 404) {
          // Silently fail on 404 (expected in dev mode)
          throw new Error('Not found');
        }
        return res.json();
      });
      if (Array.isArray(data) && data.length) {
        setCachedJSON(CACHE_KEY, data).catch(() => {});
        return data as Resource[];
      }
    } catch {}
  }
  // Try cache
  const cached = await getCachedJSON<Resource[]>(CACHE_KEY);
  if (cached?.length) return cached;
  // Fallback local
  return local;
}
