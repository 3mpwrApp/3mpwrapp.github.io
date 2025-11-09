/**
 * Campaign Sync Service
 * Syncs campaigns from Firestore to https://3mpwrapp.pages.dev/campaigns/ via Cloudflare Worker
 */

import { logger } from '../utils/logger';

const CAMPAIGN_SYNC_ENDPOINT = 'https://3mpwrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns';

export type CampaignSyncData = {
  id: string;
  title: string;
  summary: string;
  target?: string;
  goalCount?: number;
  contactEmail?: string;
  createdBy?: string;
  createdAt: number;
  membersCount?: number;
  updatedAt?: number;
};

/**
 * Sync a campaign to the website (create or update)
 */
export async function syncCampaignToWebsite(campaign: CampaignSyncData): Promise<boolean> {
  try {
    logger.log('[CampaignSync] Syncing campaign to website:', campaign.id);
    
    const response = await fetch(CAMPAIGN_SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaign),
    });

    if (!response.ok) {
      logger.error('[CampaignSync] Failed to sync campaign:', response.status, response.statusText);
      return false;
    }

    logger.log('[CampaignSync] Campaign synced successfully:', campaign.id);
    return true;
  } catch (error) {
    logger.error('[CampaignSync] Error syncing campaign:', error);
    return false;
  }
}

/**
 * Remove a campaign from the website
 */
export async function removeCampaignFromWebsite(campaignId: string): Promise<boolean> {
  try {
    logger.log('[CampaignSync] Removing campaign from website:', campaignId);
    
    const response = await fetch(`${CAMPAIGN_SYNC_ENDPOINT}/${campaignId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      logger.error('[CampaignSync] Failed to remove campaign:', response.status, response.statusText);
      return false;
    }

    logger.log('[CampaignSync] Campaign removed successfully:', campaignId);
    return true;
  } catch (error) {
    logger.error('[CampaignSync] Error removing campaign:', error);
    return false;
  }
}

/**
 * Sync all campaigns from Firestore to website (bulk sync)
 */
export async function syncAllCampaignsToWebsite(campaigns: CampaignSyncData[]): Promise<boolean> {
  try {
    logger.log('[CampaignSync] Syncing all campaigns to website:', campaigns.length);
    
    const response = await fetch(`${CAMPAIGN_SYNC_ENDPOINT}/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ campaigns }),
    });

    if (!response.ok) {
      logger.error('[CampaignSync] Failed to bulk sync campaigns:', response.status, response.statusText);
      return false;
    }

    logger.log('[CampaignSync] All campaigns synced successfully');
    return true;
  } catch (error) {
    logger.error('[CampaignSync] Error bulk syncing campaigns:', error);
    return false;
  }
}
