import { withFallback, retry } from "./api";
import { events as local } from "../data/events";
import type { Event } from "../data/events";
import { getCachedJSON, setCachedJSON } from "./cache";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

const CACHE_KEY = "events:v1";

export const fetchEvents = withFallback<Event[]>(
  async () => {
    if (!BASE) throw new Error("No API base");
    const data = await retry(async () => (await fetch(`${BASE}/events`)).json());
    if (Array.isArray(data) && data.length) {
      setCachedJSON(CACHE_KEY, data).catch(() => {});
    }
    return data;
  },
  async () => (await getCachedJSON<Event[]>(CACHE_KEY)) ?? local
);
