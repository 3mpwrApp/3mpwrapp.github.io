import type { Event } from "../data/events";
import { events as local } from "../data/events";

import { retry, withFallback } from "./api";
import { getCachedJSON, setCachedJSON } from "./cache";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

const CACHE_KEY = "events:v1";

export const fetchEvents = withFallback<Event[]>(
  async () => {
    if (!BASE) throw new Error("No API base");
    const response = await retry(async () =>
      (await fetch(`${BASE}/events`)).json(),
    );
    // Handle both array format (old API) and object format (Cloudflare Worker)
    const data = Array.isArray(response) ? response : (response?.events ?? []);
    if (Array.isArray(data) && data.length) {
      setCachedJSON(CACHE_KEY, data).catch(() => {});
    }
    return data;
  },
  async () => (await getCachedJSON<Event[]>(CACHE_KEY)) ?? local,
);
