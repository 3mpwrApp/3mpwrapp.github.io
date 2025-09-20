import { campaigns as local } from "../data/campaigns";
import type { Campaign } from "../types/models";
import { withFallback, retry } from "./api";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

export const fetchCampaigns = withFallback<Campaign[]>(
  async () => {
    if (!BASE) throw new Error("No API base");
    return await retry(async () => (await fetch(`${BASE}/campaigns`)).json());
  },
  () => local,
);
