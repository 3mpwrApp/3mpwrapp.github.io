import { retry } from "./api";
import { resources as local } from "../data/resources";
import type { Resource } from "../types/models";
import { getCachedJSON, setCachedJSON } from "./cache";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";
const CACHE_KEY = "resources:v1";

export async function fetchResources(): Promise<Resource[]> {
  // Try remote API
  if (BASE) {
    try {
      const data = await retry(async () => (await fetch(`${BASE}/resources`)).json());
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
