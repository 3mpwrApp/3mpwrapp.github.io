import { stories as local } from "../data/stories";
import type { Story } from "../data/stories";
import { withFallback, retry } from "./api";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

export const fetchStories = withFallback<Story[]>(
  async () => {
    if (!BASE) throw new Error("No API base");
    return await retry(async () => (await fetch(`${BASE}/stories`)).json());
  },
  () => local,
);
