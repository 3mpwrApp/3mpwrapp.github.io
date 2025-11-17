#!/usr/bin/env node
/**
 * Sync events and campaigns to Cloudflare Workers
 * 
 * This script reads the public API JSON files and syncs them to Cloudflare KV storage
 * via the Workers API endpoints.
 * 
 * Usage:
 *   node scripts/sync-to-cloudflare.mjs [--full]
 *   --full: Use full campaign data instead of compressed version
 * 
 * Environment:
 *   CLOUDFLARE_EVENTS_WORKER_URL - URL of events worker (default: https://3mpwrapp-calendar.empowrapp08162025.workers.dev)
 *   CLOUDFLARE_CAMPAIGNS_WORKER_URL - URL of campaigns worker (default: https://3mpwrapp-campaigns.empowrapp08162025.workers.dev)
 */

import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const EVENTS_WORKER_URL = process.env.CLOUDFLARE_EVENTS_WORKER_URL || 
  'https://3mpwrapp-calendar.empowrapp08162025.workers.dev';
const CAMPAIGNS_WORKER_URL = process.env.CLOUDFLARE_CAMPAIGNS_WORKER_URL || 
  'https://empowrapp-campaigns.empowrapp08162025.workers.dev';

// Check for --full flag
const useFullData = process.argv.includes('--full');

/**
 * Compress campaign data by removing verbose fields not needed for app display
 */
function compressCampaign(campaign) {
  const compressed = { ...campaign };

  // Keep essential fields for app display
  const essentialFields = [
    'id', 'title', 'summary', 'target', 'goalCount', 'membersCount',
    'contactEmail', 'createdAt', 'petitionId', 'petitionUrl', 'websiteUrl',
    'actionItems', 'legislation'
  ];

  // Remove verbose fields that can be fetched on-demand
  delete compressed.description; // Remove long descriptions
  delete compressed.shareTemplates; // Remove share templates (can be generated)
  delete compressed.internationalModel; // Remove detailed model info

  // Compress legislation to just essential info
  if (compressed.legislation) {
    compressed.legislation = compressed.legislation.map(leg => ({
      name: leg.name,
      status: leg.status,
      url: leg.url || null // Keep only essential fields
    }));
  }

  // Compress action items to minimal format
  if (compressed.actionItems) {
    compressed.actionItems = compressed.actionItems.map(item => ({
      id: item.id,
      text: item.text,
      completed: item.completed || false
    }));
  }

  return compressed;
}

async function syncEvents() {
  console.log('📅 Syncing events to Cloudflare Worker...');
  
  try {
    // Read events from public API
    const eventsPath = join(ROOT, 'public', 'api', 'events.json');
    const eventsData = await fs.readFile(eventsPath, 'utf-8');
    const events = JSON.parse(eventsData);
    
    console.log(`   Found ${events.length} events to sync`);
    
    // Bulk sync to Cloudflare Worker
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

async function syncCampaigns() {
  console.log('\n📢 Syncing campaigns to Cloudflare Worker...');
  
  try {
    // Read campaigns from public API
    const campaignsPath = useFullData 
      ? join(ROOT, 'public', 'api', 'campaigns-full.json')
      : join(ROOT, 'public', 'api', 'campaigns.json');
    
    const campaignsData = await fs.readFile(campaignsPath, 'utf-8');
    let campaigns = JSON.parse(campaignsData);
    
    // Compress campaigns unless --full flag is used
    if (!useFullData) {
      campaigns = campaigns.map(compressCampaign);
      console.log(`   Using compressed data (${campaigns.length} campaigns)`);
    } else {
      console.log(`   Using full data (${campaigns.length} campaigns)`);
    }
    
    console.log(`   Found ${campaigns.length} campaigns to sync`);
    
    // Bulk sync to Cloudflare Worker
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

async function verifySync() {
  console.log('\n🔍 Verifying sync...');
  
  try {
    // Check events
    const eventsResponse = await fetch(`${EVENTS_WORKER_URL}/api/events`);
    const eventsData = await eventsResponse.json();
    console.log(`   Events in production: ${eventsData.events?.length || 0}`);
    
    // Check campaigns
    const campaignsResponse = await fetch(`${CAMPAIGNS_WORKER_URL}/api/campaigns`);
    const campaignsData = await campaignsResponse.json();
    console.log(`   Campaigns in production: ${campaignsData.campaigns?.length || 0}`);
    
    console.log('\n✨ Verification complete!');
    console.log('\n🌐 Public URLs:');
    console.log(`   Events: ${EVENTS_WORKER_URL}/api/events`);
    console.log(`   Campaigns: ${CAMPAIGNS_WORKER_URL}/api/campaigns`);
    console.log(`   ICS Feed: ${EVENTS_WORKER_URL}/events.ics`);
    console.log('\n📱 Website:');
    console.log('   https://3mpwrapp.pages.dev/events/');
    console.log('   https://3mpwrapp.pages.dev/campaigns/');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Cloudflare Workers sync...\n');
  console.log('📍 Target workers:');
  console.log(`   Events: ${EVENTS_WORKER_URL}`);
  console.log(`   Campaigns: ${CAMPAIGNS_WORKER_URL}`);
  console.log(`   Mode: ${useFullData ? 'FULL DATA' : 'COMPRESSED DATA (recommended)'}`);
  console.log('');
  
  try {
    // Sync both in parallel
    await Promise.all([
      syncEvents(),
      syncCampaigns()
    ]);
    
    // Verify the sync
    await verifySync();
    
    console.log('\n🎉 All data synced successfully!');
    
  } catch (error) {
    console.error('\n💥 Sync failed:', error.message);
    process.exit(1);
  }
}

main();
