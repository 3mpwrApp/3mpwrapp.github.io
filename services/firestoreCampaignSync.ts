/**
 * Firestore Campaign Sync Service
 * Enables bidirectional real-time sync between app and Firestore campaigns_production collection
 * Campaigns created/edited/deleted on app automatically sync to Firestore
 * Changes in Firestore are pushed to app via real-time listeners
 */

import type * as Fire from "firebase/firestore";

import { db as sharedDb } from "../firebase/config";
import { logger } from "../utils/logger";


let mod: typeof Fire | null = null;

async function ensure(): Promise<typeof Fire | null> {
  if (mod) return mod;
  try {
    mod = await import("firebase/firestore");
    return mod;
  } catch (error) {
    logger.error("[FirestoreCampaignSync] Failed to load firebase/firestore:", error);
    return null;
  }
}

export async function getDB() {
  return sharedDb ?? null;
}

/**
 * Campaign data interface for Firestore sync operations
 */
export interface FirestoreSyncCampaign {
  id: string;
  title: string;
  summary: string;
  target?: string;
  goalCount?: number;
  membersCount?: number;
  contactEmail?: string;
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
  status?: 'published' | 'draft' | 'archived';
  
  // Optional extended fields
  petitionId?: string;
  petitionUrl?: string;
  websiteUrl?: string;
  description?: string;
}

/**
 * Create or update campaign in campaigns_production collection
 * This collection is read by the Cloudflare Worker and displayed on the website
 * @param campaign Campaign data
 * @param uid User ID (creator)
 * @param collection Which collection to sync to ('campaigns_production' or 'campaigns_preview')
 * @returns True if successful
 */
export async function syncCampaignToProduction(
  campaign: FirestoreSyncCampaign,
  uid: string,
  collection: 'campaigns_production' | 'campaigns_preview' = 'campaigns_production'
): Promise<boolean> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncCampaign] Firestore not available for production sync');
    return false;
  }

  try {
    const campaignData = {
      id: campaign.id,
      title: campaign.title,
      summary: campaign.summary,
      target: campaign.target || '',
      goalCount: campaign.goalCount || 0,
      membersCount: campaign.membersCount || 0,
      contactEmail: campaign.contactEmail || '',
      createdBy: uid,
      createdAt: campaign.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      status: campaign.status || 'published',
      
      // Optional fields
      petitionId: campaign.petitionId || '',
      petitionUrl: campaign.petitionUrl || '',
      websiteUrl: campaign.websiteUrl || '',
      description: campaign.description || '',
    };

    await m.setDoc(
      m.doc(db, collection, campaign.id),
      campaignData,
      { merge: true }
    );

    logger.log('[FirestoreSyncCampaign] Campaign synced to', collection, ':', campaign.id);
    return true;
  } catch (error) {
    logger.error('[FirestoreSyncCampaign] Failed to sync campaign to', collection, ':', error);
    return false;
  }
}

/**
 * Update campaign in campaigns_production or campaigns_preview collection
 * @param id Campaign ID
 * @param updates Partial campaign data to update
 * @param _uid User ID (must match creator or be admin - validated by Firestore rules)
 * @param collection Which collection to update ('campaigns_production' or 'campaigns_preview')
 * @returns True if successful
 */
export async function updateCampaignInProduction(
  id: string,
  updates: Partial<FirestoreSyncCampaign>,
  _uid: string,
  collection: 'campaigns_production' | 'campaigns_preview' = 'campaigns_production'
): Promise<boolean> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncCampaign] Firestore not available for update');
    return false;
  }

  try {
    await m.updateDoc(
      m.doc(db, collection, id),
      {
        ...updates,
        updatedAt: Date.now(),
      } as any
    );

    logger.log('[FirestoreSyncCampaign] Campaign updated in', collection, ':', id);
    return true;
  } catch (error) {
    logger.error('[FirestoreSyncCampaign] Failed to update campaign in', collection, ':', error);
    return false;
  }
}

/**
 * Delete campaign from campaigns_production or campaigns_preview collection
 * @param id Campaign ID
 * @param collection Which collection to delete from ('campaigns_production' or 'campaigns_preview')
 * @returns True if successful
 */
export async function deleteCampaignFromProduction(
  id: string,
  collection: 'campaigns_production' | 'campaigns_preview' = 'campaigns_production'
): Promise<boolean> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncCampaign] Firestore not available for delete');
    return false;
  }

  try {
    await m.deleteDoc(m.doc(db, collection, id));
    logger.log('[FirestoreSyncCampaign] Campaign deleted from', collection, ':', id);
    return true;
  } catch (error) {
    logger.error('[FirestoreSyncCampaign] Failed to delete campaign from', collection, ':', error);
    return false;
  }
}

/**
 * Subscribe to real-time campaign updates from production collection
 * @param callback Function to call when campaigns change
 * @param onError Optional error handler
 * @param collection Which collection to listen to ('campaigns_production' or 'campaigns_preview')
 * @returns Unsubscribe function
 */
export function subscribeToCampaignUpdates(
  callback: (campaigns: FirestoreSyncCampaign[]) => void,
  onError?: (error: Error) => void,
  collection: 'campaigns_production' | 'campaigns_preview' = 'campaigns_production'
): () => void {
  let unsubscribe: (() => void) | null = null;

  (async () => {
    const m = await ensure();
    const db = await getDB();
    if (!m || !db) {
      logger.warn('[FirestoreSyncCampaign] Firestore not available for subscription');
      return;
    }

    try {
      const q = m.query(
        m.collection(db, collection),
        m.where('status', '==', 'published'),
        m.orderBy('createdAt', 'desc')
      );

      unsubscribe = m.onSnapshot(
        q,
        (snapshot) => {
          const campaigns: FirestoreSyncCampaign[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            campaigns.push({
              id: doc.id,
              title: data.title,
              summary: data.summary,
              target: data.target,
              goalCount: data.goalCount,
              membersCount: data.membersCount,
              contactEmail: data.contactEmail,
              createdBy: data.createdBy,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              status: data.status,
              petitionId: data.petitionId,
              petitionUrl: data.petitionUrl,
              websiteUrl: data.websiteUrl,
              description: data.description,
            });
          });

          callback(campaigns);
        },
        (error) => {
          logger.error('[FirestoreSyncCampaign] Subscription error:', error);
          if (onError) onError(error as Error);
        }
      );
    } catch (error) {
      logger.error('[FirestoreSyncCampaign] Failed to set up subscription:', error);
      if (onError) onError(error as Error);
    }
  })();

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}

/**
 * Fetch all published campaigns from campaigns collections
 * @param collection Which collection to fetch from ('campaigns_production' or 'campaigns_preview')
 * @returns Array of campaigns
 */
export async function fetchCampaignUpdates(
  collection: 'campaigns_production' | 'campaigns_preview' = 'campaigns_production'
): Promise<FirestoreSyncCampaign[]> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncCampaign] Firestore not available for fetch');
    return [];
  }

  try {
    const q = m.query(
      m.collection(db, collection),
      m.where('status', '==', 'published'),
      m.orderBy('createdAt', 'desc')
    );

    const snapshot = await m.getDocs(q);
    const campaigns: FirestoreSyncCampaign[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        summary: data.summary,
        target: data.target,
        goalCount: data.goalCount,
        membersCount: data.membersCount,
        contactEmail: data.contactEmail,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        status: data.status,
        petitionId: data.petitionId,
        petitionUrl: data.petitionUrl,
        websiteUrl: data.websiteUrl,
        description: data.description,
      };
    });

    logger.log('[FirestoreSyncCampaign] Fetched', campaigns.length, 'campaigns from', collection);
    return campaigns;
  } catch (error) {
    logger.error('[FirestoreSyncCampaign] Failed to fetch campaigns:', error);
    return [];
  }
}

/**
 * Get a single campaign from campaigns collections by ID
 * @param id Campaign ID
 * @param collection Which collection to query ('campaigns_production' or 'campaigns_preview')
 * @returns Campaign data or null
 */
export async function getCampaignFromProduction(
  id: string,
  collection: 'campaigns_production' | 'campaigns_preview' = 'campaigns_production'
): Promise<FirestoreSyncCampaign | null> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncCampaign] Firestore not available for get');
    return null;
  }

  try {
    const docSnap = await m.getDoc(m.doc(db, collection, id));
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      summary: data.summary,
      target: data.target,
      goalCount: data.goalCount,
      membersCount: data.membersCount,
      contactEmail: data.contactEmail,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      status: data.status,
      petitionId: data.petitionId,
      petitionUrl: data.petitionUrl,
      websiteUrl: data.websiteUrl,
      description: data.description,
    };
  } catch (error) {
    logger.error('[FirestoreSyncCampaign] Failed to get campaign:', error);
    return null;
  }
}

/**
 * Check if Firestore sync is available
 * @returns True if Firestore is properly configured
 */
export async function isFirestoreSyncAvailable(): Promise<boolean> {
  const m = await ensure();
  const db = await getDB();
  return !!(m && db);
}

/**
 * Increment campaign members count
 * @param id Campaign ID
 * @param collection Which collection to update ('campaigns_production' or 'campaigns_preview')
 * @returns True if successful
 */
export async function incrementCampaignMembers(
  id: string,
  collection: 'campaigns_production' | 'campaigns_preview' = 'campaigns_production'
): Promise<boolean> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncCampaign] Firestore not available for increment');
    return false;
  }

  try {
    await m.updateDoc(
      m.doc(db, collection, id),
      {
        membersCount: m.increment(1),
        updatedAt: Date.now(),
      } as any
    );

    logger.log('[FirestoreSyncCampaign] Campaign members incremented:', id);
    return true;
  } catch (error) {
    logger.error('[FirestoreSyncCampaign] Failed to increment members:', error);
    return false;
  }
}
