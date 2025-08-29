import { withFallback } from "./api";
import { podcasts as local } from "../data/podcasts";
import type { Podcast } from "../data/podcasts";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

export const fetchPodcasts = withFallback<Podcast[]>(
  async () => {
    if (!BASE) throw new Error("No API base");
    return await (await fetch(`${BASE}/podcasts`)).json();
  },
  () => local
);

