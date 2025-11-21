#!/usr/bin/env node
/**
 * Sync Firestore events and campaigns directly to Cloudflare Workers
 * 
 * This script:
 * 1. Fetches all events from Firestore events_preview collection
 * 2. Fetches all campaigns from Firestore campaigns_preview collection
 * 3. Syncs them to Cloudflare KV via Worker API endpoints
 * 
 * Usage:
 *   node scripts/sync-firestore-to-cloudflare.mjs
 */

import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const EVENTS_WORKER_URL = process.env.CLOUDFLARE_EVENTS_WORKER_URL || 
  'https://3mpwrapp-calendar.empowrapp08162025.workers.dev';
const CAMPAIGNS_WORKER_URL = process.env.CLOUDFLARE_CAMPAIGNS_WORKER_URL || 
  'https://empowrapp-campaigns.empowrapp08162025.workers.dev';

// Initialize Firebase Admin
let db;
try {
  const serviceAccountPath = join(ROOT, 'serviceAccountKey.json');
  const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf-8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  db = admin.firestore();
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
  process.exit(1);
}

/**
 * Fetch all events from Firestore events_preview collection
 */
async function fetchEventsFromFirestore() {
  console.log('\n📅 Fetching events from Firestore...');
  
  try {
    const snapshot = await db.collection('events_preview').get();
    const events = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamp to ISO string if needed
      if (data.date && typeof data.date === 'object' && data.date.toDate) {
        data.date = data.date.toDate().toISOString();
      }
      
      events.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log(`   Found ${events.length} events in Firestore`);
    return events;
  } catch (error) {
    console.error('❌ Failed to fetch events from Firestore:', error.message);
    throw error;
  }
}

/**
 * Fetch all campaigns from Firestore campaigns_preview collection
 */
async function fetchCampaignsFromFirestore() {
  console.log('\n📢 Fetching campaigns from Firestore...');
  
  try {
    const snapshot = await db.collection('campaigns_preview').get();
    const campaigns = [];
    
    snapshot.forEach(doc => {
      campaigns.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`   Found ${campaigns.length} campaigns in Firestore`);
    return campaigns;
  } catch (error) {
    console.error('❌ Failed to fetch campaigns from Firestore:', error.message);
    throw error;
  }
}

/**
 * Sync events to Cloudflare Worker
 */
async function syncEventsToCloudflare(events) {
  console.log('\n📤 Syncing events to Cloudflare Worker...');
  
  try {
    const response = await fetch(`${EVENTS_WORKER_URL}/api/events/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to sync events: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`✅ Events synced: ${result.successful} succeeded, ${result.failed} failed`);
    
    return result;
  } catch (error) {
    console.error('❌ Events sync failed:', error.message);
    throw error;
  }
}

/**
 * Sync campaigns to Cloudflare Worker
 */
async function syncCampaignsToCloudflare(campaigns) {
  console.log('\n📤 Syncing campaigns to Cloudflare Worker...');
  
  try {
    const response = await fetch(`${CAMPAIGNS_WORKER_URL}/api/campaigns/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ campaigns })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to sync campaigns: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`✅ Campaigns synced: ${result.successful} succeeded, ${result.failed} failed`);
    
    return result;
  } catch (error) {
    console.error('❌ Campaigns sync failed:', error.message);
    throw error;
  }
}

/**
 * Verify sync by fetching counts from Workers
 */
async function verifySync() {
  console.log('\n🔍 Verifying sync...');
  
  try {
    // Check events (production)
    const eventsResponseProd = await fetch(`${EVENTS_WORKER_URL}/api/events`);
    const eventsDataProd = await eventsResponseProd.json();
    console.log(`   Events in production: ${eventsDataProd.events?.length || 0}`);
    
    // Check events (preview)
    const eventsResponsePrev = await fetch(`${EVENTS_WORKER_URL}/api/events?env=preview`);
    const eventsDataPrev = await eventsResponsePrev.json();
    console.log(`   Events in preview: ${eventsDataPrev.events?.length || 0}`);
    
    // Check campaigns
    const campaignsResponse = await fetch(`${CAMPAIGNS_WORKER_URL}/api/campaigns`);
    const campaignsData = await campaignsResponse.json();
    console.log(`   Campaigns: ${campaignsData.campaigns?.length || 0}`);
    
    console.log('\n✨ Verification complete!');
    console.log('\n🌐 Public URLs:');
    console.log(`   Events (prod): ${EVENTS_WORKER_URL}/api/events`);
    console.log(`   Events (preview): ${EVENTS_WORKER_URL}/api/events?env=preview`);
    console.log(`   Campaigns: ${CAMPAIGNS_WORKER_URL}/api/campaigns`);
    console.log(`   ICS Feed: ${EVENTS_WORKER_URL}/events.ics`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Firestore → Cloudflare Workers sync...\n');
  console.log('📍 Source: Firestore (events_preview, campaigns_preview)');
  console.log('📍 Target workers:');
  console.log(`   Events: ${EVENTS_WORKER_URL}`);
  console.log(`   Campaigns: ${CAMPAIGNS_WORKER_URL}`);
  console.log('');
  
  try {
    // Fetch data from Firestore
    const [events, campaigns] = await Promise.all([
      fetchEventsFromFirestore(),
      fetchCampaignsFromFirestore()
    ]);
    
    // Sync to Cloudflare Workers
    await Promise.all([
      syncEventsToCloudflare(events),
      syncCampaignsToCloudflare(campaigns)
    ]);
    
    // Verify the sync
    await verifySync();
    
    console.log('\n🎉 Firestore data synced successfully to Cloudflare Workers!');
    
  } catch (error) {
    console.error('\n💥 Sync failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

main();
