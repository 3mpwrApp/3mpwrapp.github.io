#!/usr/bin/env tsx
/**
 * Sync REAL campaigns from data/campaigns.ts to Firestore
 * Syncs to both campaigns_production and campaigns_preview collections
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

import { campaigns } from '../data/campaigns';

// Firebase config from your project
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncCampaignsToFirestore() {
  console.log(`\n📣 Syncing ${campaigns.length} REAL campaigns to Firestore...\n`);

  for (const campaign of campaigns) {
    const campaignData = {
      id: campaign.id,
      title: campaign.title,
      summary: campaign.summary,
      target: campaign.target || '',
      goalCount: campaign.goalCount || 0,
      membersCount: campaign.membersCount || 0,
      contactEmail: campaign.contactEmail || '',
      createdAt: campaign.createdAt || Date.now(),
      updatedAt: Date.now(),
      status: 'published',
      
      // Extended fields (cast to any to avoid type issues)
      ...(campaign as any).petitionId && { petitionId: (campaign as any).petitionId },
      ...(campaign as any).petitionUrl && { petitionUrl: (campaign as any).petitionUrl },
      ...(campaign as any).websiteUrl && { websiteUrl: (campaign as any).websiteUrl },
      ...(campaign as any).description && { description: (campaign as any).description },
    };

    try {
      // Sync to production collection
      await setDoc(
        doc(db, 'campaigns_production', campaign.id),
        campaignData,
        { merge: true }
      );
      console.log(`✅ [PRODUCTION] ${campaign.title}`);

      // Sync to preview collection
      await setDoc(
        doc(db, 'campaigns_preview', campaign.id),
        campaignData,
        { merge: true }
      );
      console.log(`✅ [PREVIEW] ${campaign.title}`);
    } catch (error) {
      console.error(`❌ Failed to sync ${campaign.title}:`, error);
    }
  }

  console.log(`\n✨ Sync complete! ${campaigns.length} campaigns synced to Firestore.\n`);
}

syncCampaignsToFirestore()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  });
