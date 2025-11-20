#!/usr/bin/env node
/**
 * SYNC CAMPAIGNS TO FIRESTORE
 * 
 * Syncs all campaigns from data/campaigns.ts to Firestore production and preview collections
 * so they appear on the website via Cloudflare Workers.
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://empowrapp-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

// Campaigns from data/campaigns.ts
const campaigns = [
  {
    id: 'every-canadian-counts',
    title: 'Every Canadian Counts',
    summary: 'Support a publicly funded national disability insurance plan for Canadians with long-term or chronic disabilities. Sign and share petition e-6746.',
    target: 'Parliament of Canada',
    goalCount: 100000,
    membersCount: 460,
    contactEmail: 'info@everycanadiancounts.com',
    createdAt: 1731196800000, // November 9, 2025
  },
  {
    id: 'no-more-poverty-pwd',
    title: 'No More Poverty for Persons with Disabilities',
    summary: 'Fight for adequate financial support for ALL disabled Canadians living on government-imposed poverty-level disability income support. Join the movement to end poverty for persons with disabilities across Canada.',
    target: 'Federal and Provincial Governments',
    goalCount: 50000,
    membersCount: 0,
    contactEmail: 'contact@ashoutabout.ca',
    createdAt: Date.now(), // November 15, 2025
  },
  {
    id: 'stop-cpp-disability-privatization',
    title: 'Stop CPP Disability Privatization',
    summary: 'End the privatization of CPP Disability benefits by insurance companies. Restore disabled Canadians\' earned pensions and stop insurers from profiting twice from our contributions. Sign petition e-6873.',
    target: 'Parliament of Canada',
    goalCount: 25000,
    membersCount: 0,
    contactEmail: 'karen@thetiderises.ca',
    createdAt: Date.now(), // November 15, 2025
  },
  {
    id: 'rights-dont-retire',
    title: 'Rights Don\'t Retire - Queens Park Rally',
    summary: 'Injured Workers are coming to Queens Park Toronto to demand removal of the age 65 cut-off for Older Injured Workers from the Workplace Safety and Insurance Act (WSIA). Email your MPP now.',
    target: 'Ontario Provincial Government & MPPs',
    goalCount: 10000,
    membersCount: 0,
    contactEmail: 'info@injuredworkerscommunitylegalclinic.ca',
    createdAt: Date.now(), // November 20, 2025
  },
];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   🚀 SYNCING CAMPAIGNS TO FIRESTORE                         ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

async function syncCampaigns() {
  // Sync to both production and preview collections
  for (const collectionName of ['campaigns_production', 'campaigns_preview']) {
    console.log(`\n📦 Processing collection: ${collectionName}`);
    console.log('─'.repeat(64));
    
    for (const campaign of campaigns) {
      try {
        console.log(`\n📣 Syncing: ${campaign.title}`);
        console.log(`   ID: ${campaign.id}`);
        console.log(`   Target: ${campaign.target}`);
        console.log(`   Goal: ${campaign.goalCount.toLocaleString()} signatures`);
        
        // Campaign data for Firestore
        const campaignData = {
          ...campaign,
          createdAt: admin.firestore.Timestamp.fromMillis(campaign.createdAt),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          syncedBy: 'system-admin',
        };
        
        await db.collection(collectionName).doc(campaign.id).set(campaignData, { merge: true });
        
        console.log(`   ✅ Synced to ${collectionName}`);
      } catch (error) {
        console.error(`   ❌ Failed to sync ${campaign.id}:`, error.message);
      }
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ ALL CAMPAIGNS SYNCED TO FIRESTORE!');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('📊 Summary:');
  console.log(`   • Total Campaigns: ${campaigns.length}`);
  console.log(`   • Collections Updated: campaigns_production, campaigns_preview`);
  console.log('');
  
  console.log('🔄 Cloudflare Worker Cache:');
  console.log('   Cache will refresh automatically in 5 minutes (TTL: 300s)');
  console.log('   Or redeploy worker to clear cache immediately\n');
  
  console.log('📱 Test in App:');
  console.log('   Pull to refresh on Campaigns screen');
  console.log('   Should see 2 campaigns now\n');
  
  console.log('🌐 Test on Website:');
  console.log('   https://3mpwrapp.pages.dev/campaigns/');
  console.log('   Wait 5 minutes for cache to clear\n');
  
  console.log('🧪 Test Campaigns Worker:');
  console.log('   https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns\n');
}

syncCampaigns()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to sync campaigns:', err);
    process.exit(1);
  });
