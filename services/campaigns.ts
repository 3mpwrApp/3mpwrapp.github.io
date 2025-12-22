import { campaigns as local } from "../data/campaigns";
import type { Campaign } from "../types/models";

import { retry, withFallback } from "./api";
import {
  measurePerformance,
  startTransaction,
  captureException,
  addBreadcrumb,
  setMeasurement,
} from "./sentryLabeling";

// Use dedicated campaigns API or fall back to main API
const BASE = process.env.EXPO_PUBLIC_CAMPAIGNS_API_BASE ?? process.env.EXPO_PUBLIC_API_BASE ?? "";

/**
 * Fetch campaigns from Cloudflare Campaigns Worker API with fallback to local data
 */
export const fetchCampaigns = withFallback<Campaign[]>(
  async () => {
    return await measurePerformance(
      'fetch_campaigns',
      async () => {
        if (!BASE) {
          addBreadcrumb('No API base, will use fallback', 'campaigns', 'info');
          throw new Error("No API base");
        }

        const response = await retry(async () => {
          const fetchSpan = startTransaction('campaigns_api_request', 'http.client', {
            description: 'Fetching campaigns from API',
            tags: { feature: 'campaigns', api_endpoint: 'campaigns.json' },
          });

          try {
            addBreadcrumb('Fetching campaigns from API', 'http', 'info');
            const res = await fetch(`${BASE}/campaigns.json`);

            if (!res.ok) {
              if (fetchSpan) (fetchSpan as any).setStatus?.('internal_error');
              throw new Error(`API returned ${res.status}`);
            }

            const data = await res.json();
            if (fetchSpan) (fetchSpan as any).setStatus?.('ok');

            // Track response size
            const campaignCount = Array.isArray(data) ? data.length : (data.campaigns?.length || 0);
            setMeasurement('campaigns_count', campaignCount, 'none');
            addBreadcrumb(`Fetched ${campaignCount} campaigns`, 'campaigns', 'info');

            return data;
          } catch (error) {
            if (fetchSpan) (fetchSpan as any).setStatus?.('internal_error');
            captureException(error as Error, {
              feature: 'campaigns',
              severity: 'warning',
              tags: { operation: 'fetch_api' },
            });
            throw error;
          } finally {
            if (fetchSpan) (fetchSpan as any).finish?.();
          }
        });

        // Public JSON returns array directly, Cloudflare Worker returns { campaigns: [...] }
        return Array.isArray(response) ? response : (response.campaigns || []);
      },
      {
        op: 'http.client',
        tags: { feature: 'campaigns', source: 'api' },
      }
    );
  },
  () => {
    addBreadcrumb('Using local campaigns fallback', 'campaigns', 'info');
    setMeasurement('campaigns_count', local.length, 'none');
    return local;
  },
);

/**
 * Fetch a single campaign by ID from API with fallback to local
 */
export async function fetchCampaignById(id: string): Promise<Campaign | null> {
  return await measurePerformance(
    'fetch_campaign_by_id',
    async () => {
      try {
        if (!BASE) {
          addBreadcrumb('No API base, using local fallback', 'campaigns', 'info');
          const campaign = local.find((c) => c.id === id) || null;
          setMeasurement('campaign_source', campaign ? 1 : 0, 'none'); // 1 = found, 0 = not found
          return campaign;
        }

        addBreadcrumb(`Fetching campaign by ID: ${id}`, 'campaigns', 'info');

        const response = await retry(async () => {
          const res = await fetch(`${BASE}/campaigns/${id}`);
          if (!res.ok) {
            if (res.status === 404) {
              addBreadcrumb(`Campaign ${id} not found (404)`, 'campaigns', 'warning');
              return null;
            }
            throw new Error(`API returned ${res.status}`);
          }
          return res.json();
        });

        if (response) {
          addBreadcrumb(`Campaign ${id} fetched successfully`, 'campaigns', 'info');
        }

        return response;
      } catch (error) {
        // Fallback to local data on error
        addBreadcrumb('API error, falling back to local data', 'campaigns', 'warning');
        captureException(error as Error, {
          feature: 'campaigns',
          severity: 'warning',
          tags: { operation: 'fetch_by_id', campaign_id: id },
        });
        return local.find((c) => c.id === id) || null;
      }
    },
    {
      op: 'http.client',
      tags: { feature: 'campaigns', operation: 'fetch_by_id', campaign_id: id },
    }
  );
}
