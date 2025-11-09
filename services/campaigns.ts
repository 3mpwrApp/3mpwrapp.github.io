import { campaigns as local } from "../data/campaigns";
import type { Campaign } from "../types/models";

import { retry, withFallback } from "./api";

// Use dedicated campaigns API or fall back to main API
const BASE = process.env.EXPO_PUBLIC_CAMPAIGNS_API_BASE ?? process.env.EXPO_PUBLIC_API_BASE ?? "";

/**
 * Fetch campaigns from Cloudflare Campaigns Worker API with fallback to local data
 */
export const fetchCampaigns = withFallback<Campaign[]>(
  async () => {
    if (!BASE) throw new Error("No API base");
    const response = await retry(async () => {
      const res = await fetch(`${BASE}/campaigns`);
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      return res.json();
    });
    
    // API returns { campaigns: [...], pagination: {...}, metadata: {...} }
    return response.campaigns || [];
  },
  () => local,
);

/**
 * Fetch a single campaign by ID from API with fallback to local
 */
export async function fetchCampaignById(id: string): Promise<Campaign | null> {
  try {
    if (!BASE) {
      return local.find((c) => c.id === id) || null;
    }
    
    const response = await retry(async () => {
      const res = await fetch(`${BASE}/campaigns/${id}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`API returned ${res.status}`);
      }
      return res.json();
    });
    
    return response;
  } catch (error) {
    // Fallback to local data on error
    return local.find((c) => c.id === id) || null;
  }
}
