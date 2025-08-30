import { withFallback, retry } from "./api";
import { events as local } from "../data/events";
import type { Event } from "../data/events";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

export const fetchEvents = withFallback<Event[]>(
  async () => {
    if (!BASE) throw new Error("No API base");
    return await retry(async () => (await fetch(`${BASE}/events`)).json());
  },
  () => local
);

