/* eslint-disable no-console */
import type { Event } from "../data/events";
import { events as local } from "../data/events";

import { retry, withFallback } from "./api";
import { getCachedJSON, setCachedJSON } from "./cache";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

const CACHE_KEY = "events:v2"; // Updated cache key to force refresh

export const fetchEvents = withFallback<Event[]>(
  async () => {
    if (!BASE) {
      console.log('[Events] No API base configured, using fallback');
      throw new Error("No API base");
    }
    console.log('[Events] Fetching from:', `${BASE}/events.json`);
    const response = await retry(async () =>
      (await fetch(`${BASE}/events.json`)).json(),
    );
    console.log('[Events] Response type:', Array.isArray(response) ? 'array' : 'object');
    // Handle both array format (old API) and object format (Cloudflare Worker)
    const data = Array.isArray(response) ? response : (response?.events ?? []);
    console.log('[Events] Parsed events count:', data.length);
    if (Array.isArray(data) && data.length) {
      setCachedJSON(CACHE_KEY, data).catch(() => {});
    }
    return data;
  },
  async () => {
    console.log('[Events] Using fallback/cache');
    return (await getCachedJSON<Event[]>(CACHE_KEY)) ?? local;
  },
);
